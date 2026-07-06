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
https://nora-jqe2.onrender.com
```

- `https://nora-jqe2.onrender.com/` → site de download do APK
- `https://nora-jqe2.onrender.com/app/` → rede social no navegador
- `https://nora-jqe2.onrender.com/downloads/nora.apk` → o APK

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

## 4. O APK já vem configurado

O APK já tem a URL `https://nora-jqe2.onrender.com` embutida — quem baixar só precisa
instalar e usar, sem configurar nada.

**Importante**: isso só funciona se o serviço no Render se chamar exatamente `nora`
(o `render.yaml` já pede esse nome). Se o nome estiver ocupado e o Render gerar outra
URL (ex: `nora-abc123.onrender.com`), você tem duas opções:

- Rápida: quem instalou usa o botão "⚙ Configurar servidor" na tela de login e digita a URL certa.
- Definitiva: atualize `VITE_API_URL` em `frontend/.env.production` com a URL real e recompile:

```powershell
cd frontend
npm run build
npx cap sync android
cd android
$env:JAVA_HOME = "C:\Android\jdk21\jdk-21.0.11+10"
$env:ANDROID_HOME = "C:\Android\Androidsdk"
.\gradlew.bat assembleDebug
```

Depois copie `frontend/android/app/build/outputs/apk/debug/app-debug.apk` para
`backend/public/downloads/nora.apk`, faça commit e push — o Render redeploya sozinho.

## Avisos do plano gratuito do Render

- O serviço "dorme" após 15 min sem uso; a primeira visita depois disso demora ~40s.
- O disco é apagado a cada deploy: **fotos enviadas e contas criadas são perdidas
  quando você faz um novo deploy**. Para persistência de verdade é preciso um
  banco Postgres + armazenamento de arquivos (posso configurar depois se quiser).
