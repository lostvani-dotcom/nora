# Como colocar o Nora no ar (Render.com)

Siga estes passos para a rede social funcionar de qualquer lugar do mundo.

## 1. Suba o projeto para o GitHub

1. Crie uma conta em https://github.com (se ainda não tiver).
2. Crie um repositório novo (ex: `nora`).
3. No terminal, dentro da pasta `redesocial`:

```bash
git init
git add .
git commit -m "Nora"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/nora.git
git push -u origin main
```

## 2. Crie o serviço no Render

1. Crie uma conta gratuita em https://render.com (pode entrar com o GitHub).
2. Clique em **New + → Blueprint**.
3. Conecte o repositório `nora`.
4. O Render vai ler o arquivo `render.yaml` e configurar tudo sozinho.
5. Clique em **Apply** e aguarde o primeiro deploy (~5 minutos).

Ao final você terá uma URL como:

```
https://nora.onrender.com
```

- `https://nora.onrender.com/` → site de download do APK
- `https://nora.onrender.com/app/` → rede social no navegador
- `https://nora.onrender.com/downloads/nora.apk` → o APK

## 3. Configure o email de verificação (opcional, mas recomendado)

Sem isso, o código de verificação aparece só no log do servidor.

No painel do Render, abra o serviço → **Environment** e adicione:

| Variável   | Valor                                              |
| ---------- | -------------------------------------------------- |
| SMTP_HOST  | `smtp.gmail.com` (para Gmail)                      |
| SMTP_PORT  | `587`                                              |
| SMTP_USER  | seu email (ex: `voce@gmail.com`)                   |
| SMTP_PASS  | senha de app do Gmail (veja abaixo)                |
| SMTP_FROM  | `Nora <voce@gmail.com>`                       |

**Senha de app do Gmail**: acesse https://myaccount.google.com/apppasswords
(precisa ter verificação em 2 etapas ativada), gere uma senha de app e use-a
em `SMTP_PASS`.

Alternativa sem Gmail: crie uma conta gratuita no https://www.brevo.com
(300 emails/dia grátis) e use os dados SMTP que eles fornecem.

## 4. Aponte o APK para o servidor

O APK instalado pede o endereço do servidor na primeira vez
(botão "⚙ Configurar servidor" na tela de login). Digite a URL do Render:

```
https://nora.onrender.com
```

Para deixar a URL já embutida no APK (sem precisar configurar):

1. Edite `frontend/.env.production` e coloque `VITE_API_URL=https://nora.onrender.com`
2. Recompile: `cd frontend && npm run build && npx cap sync android && cd android && .\gradlew.bat assembleDebug`
3. Copie o novo APK para `backend/public/downloads/nora.apk`
4. Faça commit e push — o Render redeploya sozinho.

## Avisos do plano gratuito do Render

- O serviço "dorme" após 15 min sem uso; a primeira visita depois disso demora ~40s.
- O disco é apagado a cada deploy: **fotos enviadas e contas criadas são perdidas
  quando você faz um novo deploy**. Para persistência de verdade é preciso um
  banco Postgres + armazenamento de arquivos (posso configurar depois se quiser).
