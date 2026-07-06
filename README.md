# Nora

Rede social estilo Instagram: feed, posts com imagem e legenda, curtidas, comentários,
perfis, sistema de seguir e **verificação de conta por email**. Com **app Android (APK)**
e **site de download**.

## Stack

- **Backend**: Node.js, Express, Prisma ORM, SQLite, JWT, Multer (upload), Nodemailer (emails).
- **Frontend**: React (Vite), React Router.
- **App Android**: Capacitor (gera o APK a partir do mesmo frontend).

## Estrutura

```
redesocial/
├── backend/            API + serve o site e o app web
│   ├── public/         landing page (site de download, com screenshots e vídeo)
│   │   └── downloads/  nora.apk
│   └── uploads/        fotos enviadas pelos usuários
├── frontend/           app React (web + base do APK)
│   └── android/        projeto Android nativo (Capacitor)
├── render.yaml         deploy automático no Render.com
└── DEPLOY.md           passo a passo para colocar no ar
```

## Como rodar localmente

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Sobe em `http://localhost:4000`:
- `/` → site de download do APK
- `/app` → rede social (build de produção)
- `/api` → API

### Frontend (modo desenvolvimento, com hot reload)

```bash
cd frontend
npm install
npm run dev
```

Sobe em `http://localhost:5173`.

## Verificação por email

Ao se cadastrar, o usuário recebe um código de 6 dígitos por email e só consegue
entrar depois de confirmar.

- **Sem configuração**: o código aparece no console/log do servidor (bom para testar).
- **Com SMTP configurado** (`.env` do backend): o email é enviado de verdade.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=voce@gmail.com
SMTP_PASS=sua_senha_de_app
SMTP_FROM=Nora <voce@gmail.com>
```

## Gerar o APK

Pré-requisitos já instalados nesta máquina: JDK 21 em `C:\Android\jdk21`,
Android SDK em `C:\Android\Androidsdk`.

```powershell
cd frontend
npm run build
npx cap sync android
cd android
$env:JAVA_HOME = "C:\Android\jdk21\jdk-21.0.11+10"
$env:ANDROID_HOME = "C:\Android\Androidsdk"
.\gradlew.bat assembleDebug
```

APK gerado em `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.
Copie para `backend/public/downloads/nora.apk` para disponibilizar no site.

No app instalado, use "⚙ Configurar servidor" na tela de login para apontar
para o servidor público (ex: `https://nora.onrender.com`).

## Colocar no ar (funcionar de qualquer lugar)

Veja o passo a passo completo em **[DEPLOY.md](DEPLOY.md)** (Render.com, plano gratuito).

## Funcionalidades

- Cadastro com verificação por email (código de 6 dígitos, expira em 15 min, reenvio)
- Login com JWT
- Publicar foto com legenda
- Feed "Para você" e "Seguindo"
- Curtir e comentar
- Perfil com grid, bio, avatar e contadores
- Seguir / deixar de seguir
- App Android (APK) + site de download com screenshots e vídeo
