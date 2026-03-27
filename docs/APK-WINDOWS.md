# Gerar APK no Windows com Android Studio (DonAssistec)

Guia passo a passo para gerar o APK do DonAssistec no **Windows** usando **Android Studio**.

---

## 1. Instalar o Android Studio

1. Baixe o instalador para Windows:  
   **https://developer.android.com/studio**
2. Execute o instalador e siga o assistente (inclua **Android SDK** e **Android Virtual Device** se oferecidos).
3. Abra o **Android Studio** após a instalação.
4. Na tela de boas-vindas, vá em **More Actions** → **SDK Manager** e confira:
   - **Android SDK Platform** (API 34 ou superior)
   - **Android SDK Build-Tools**  
   Se faltar algo, marque e clique em **Apply** para instalar.

O Android Studio já instala e configura o **Java (JDK)** necessário.

---

## 2. Preparar o projeto no Windows

Abra o **PowerShell** ou **Prompt de Comando** na pasta do projeto DonAssistec (onde está o `package.json`).

### Instalar dependências

```powershell
npm install
```

### (Opcional) API em produção no app

Se quiser que o app no celular use a API de produção (donassistec.com.br), crie ou edite o arquivo **`.env`** na raiz do projeto:

```env
VITE_API_URL=https://donassistec.com.br/api
```

---

## 3. Build do frontend e sincronizar com Android

No mesmo terminal (PowerShell ou CMD), na pasta do projeto:

```powershell
npm run build:android
```

Isso vai:

- Fazer o build do frontend para o Capacitor (caminhos relativos para o WebView).
- Copiar o conteúdo de `dist/` para o projeto Android (`android/`).

Se der certo, você verá algo como “Copying web assets…” e “Sync finished”.

---

## 4. Abrir o projeto no Android Studio

Ainda na pasta do projeto:

```powershell
npm run cap:open:android
```

Ou manualmente no Android Studio: **File** → **Open** e selecione a pasta **`android`** dentro do DonAssistec (não a raiz do projeto).

O Android Studio vai abrir o projeto, indexar e sincronizar o Gradle. Aguarde terminar (barra de progresso no rodapé).

---

## 5. Gerar o APK

No Android Studio:

1. Menu **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
2. Espere o build terminar.
3. Quando aparecer a notificação **“APK(s) generated successfully”**, clique em **locate** (ou **Find**).

O APK de debug estará em:

```
DonAssistec\android\app\build\outputs\apk\debug\app-debug.apk
```

Você pode copiar esse arquivo para o celular e instalar (é preciso permitir “Fontes desconhecidas” nas configurações do Android, se pedido).

---

## 6. Rodar no emulador ou no celular (opcional)

### Emulador

1. No Android Studio: **Tools** → **Device Manager** (ou ícone de celular na barra).
2. Crie um dispositivo virtual (AVD) se ainda não tiver (ex.: Pixel 6, API 34).
3. Inicie o emulador (botão ▶ ao lado do AVD).
4. No Android Studio, clique no botão **Run** (▶ verde) ou use **Run** → **Run 'app'**.

O app será instalado e aberto no emulador.

### Celular físico

1. No celular: **Configurações** → **Opções do desenvolvedor** → ative **Depuração USB**.
2. Conecte o celular ao PC por USB.
3. No Android Studio, selecione o dispositivo na lista e clique em **Run** (▶).

---

## Resumo dos comandos (Windows)

| Comando | O que faz |
|--------|-----------|
| `npm install` | Instala dependências do projeto |
| `npm run build:android` | Build do frontend + sync com a pasta `android/` |
| `npm run cap:open:android` | Abre o projeto Android no Android Studio |
| `npm run cap:sync` | Só sincroniza `dist/` com `android/` (sem build) |

---

## Problemas comuns no Windows

### “VITE_CAPACITOR não é reconhecido”

O script `build:android` usa **cross-env** para definir a variável no Windows. Se ainda falhar, rode em duas etapas no PowerShell:

```powershell
$env:VITE_CAPACITOR="true"; npm run build
npx cap sync android
```

### Android Studio não encontra o JDK

No Android Studio: **File** → **Project Structure** → **SDK Location** e confira o caminho do **JDK**. O instalador do Android Studio costuma configurar isso automaticamente.

### “SDK location not found”

Abra o projeto **`android`** (pasta `android` dentro do DonAssistec), não a raiz. O arquivo `local.properties` pode ser criado automaticamente quando o SDK está configurado no Android Studio.

### Gradle falha ou demora muito

- Verifique sua conexão com a internet (o Gradle baixa dependências).
- No Android Studio: **File** → **Invalidate Caches** → **Invalidate and Restart** pode ajudar.

---

Para mais detalhes (API no app, página de download no site, etc.), veja **docs/APK.md**.
