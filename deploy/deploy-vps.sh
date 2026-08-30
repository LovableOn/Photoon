#!/usr/bin/env bash
#
# Publica o Photoon numa VPS: builda aqui e envia o resultado por ssh.
#
# Uso:
#   ./deploy/deploy-vps.sh usuario@ip-da-vps
#   ./deploy/deploy-vps.sh usuario@ip-da-vps /var/www/photoon
#
# Requer acesso ssh já configurado (chave ou senha) e nginx na VPS.
# Da primeira vez, instale o nginx e o server block:
#   scp deploy/nginx-photoon.conf usuario@ip:/tmp/
#   ssh usuario@ip 'sudo mv /tmp/nginx-photoon.conf /etc/nginx/sites-available/photoon \
#     && sudo ln -sf /etc/nginx/sites-available/photoon /etc/nginx/sites-enabled/photoon \
#     && sudo nginx -t && sudo systemctl reload nginx'

set -euo pipefail

HOST="${1:-}"
REMOTE_DIR="${2:-/var/www/photoon}"

if [ -z "$HOST" ]; then
  echo "erro: informe o destino. Ex: ./deploy/deploy-vps.sh root@203.0.113.10" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

echo "==> Instalando dependências"
npm ci --no-audit --no-fund

echo "==> Build de produção (typecheck + vite build)"
npm run build

echo "==> Enviando dist/ para $HOST:$REMOTE_DIR"
# --delete tira do servidor os arquivos que sumiram do build; sem isso o
# bundle antigo continua lá e o navegador pode continuar servindo ele.
if command -v rsync >/dev/null 2>&1; then
  ssh "$HOST" "sudo mkdir -p '$REMOTE_DIR' && sudo chown -R \$(id -u):\$(id -g) '$REMOTE_DIR'"
  rsync -az --delete dist/ "$HOST:$REMOTE_DIR/"
else
  echo "    rsync não encontrado, usando tar+ssh"
  tar -C dist -czf - . | ssh "$HOST" "sudo mkdir -p '$REMOTE_DIR' && sudo rm -rf '$REMOTE_DIR'/* && sudo tar -C '$REMOTE_DIR' -xzf -"
fi

echo "==> Recarregando o nginx"
ssh "$HOST" 'sudo nginx -t && sudo systemctl reload nginx' || {
  echo "    nginx não recarregou — confira o server block em deploy/nginx-photoon.conf" >&2
}

echo
echo "Pronto. Abra o endereço da VPS no navegador."
echo "Se ainda aparecer a versão antiga, force um recarregamento (Ctrl+Shift+R)."
