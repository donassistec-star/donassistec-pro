# Gerar APK (DonAssistec)

O app web foi configurado com **Capacitor** para gerar um APK Android. O APK é um “wrapper” do mesmo frontend que roda no navegador.

**No Windows com Android Studio?** Veja o guia passo a passo: **[docs/APK-WINDOWS.md](APK-WINDOWS.md)**.

## Pré-requisitos

Para gerar o APK você precisa de **Java (JDK 17+)** e **Android SDK**. A forma mais simples é instalar o **Android Studio**:

1. Baixe: https://developer.android.com/studio  
2. Instale e abra o Android Studio.  
3. Em **More Actions** → **SDK Manager**, instale pelo menos:
   - **Android SDK Platform** (API 34 recomendado)
   - **Android SDK Build-Tools**

O Android Studio já configura o Java necessário.

## Comandos para gerar o APK

### 1. Build do frontend e sincronizar com Android

```bash
npm run build:android
```

Isso faz:
- Build do frontend com `VITE_CAPACITOR=true` (caminhos relativos para o WebView)
- `npx cap sync android` (copia `dist/` para o projeto Android)

### 2. Gerar o APK

**Opção A – Pelo Android Studio (recomendado)**

```bash
npm run cap:open:android
```

No Android Studio:
- **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**  
- O APK de debug sai em:  
  `android/app/build/outputs/apk/debug/app-debug.apk`

**Opção B – Pela linha de comando (com Java/Android SDK no PATH)**

```bash
npm run android:apk
```

Ou manualmente:

```bash
npm run build:android
cd android && ./gradlew assembleDebug
```

APK de debug: `android/app/build/outputs/apk/debug/app-debug.apk`

### 3. APK de release (para publicar na Play Store)

No Android Studio, use **Build** → **Generate Signed Bundle / APK** e siga o assistente (criar/importar keystore, etc.).  
Ou configure assinatura no `android/app/build.gradle` e use:

```bash
cd android && ./gradlew assembleRelease
```

## API no app (APK)

Dentro do app, a origem é algo como `capacitor://localhost`. Para que o app converse com seu backend em produção:

1. Crie um arquivo `.env` na raiz do projeto (ou use o que já existe).  
2. Defina a URL da API, por exemplo:

   ```env
   VITE_API_URL=https://donassistec.com.br/api
   ```

3. Gere o build e o APK de novo:

   ```bash
   npm run build:android
   ```

Assim o app no celular usará a API em produção.

## Resumo dos scripts (package.json)

| Script              | O que faz                                                                 |
|---------------------|---------------------------------------------------------------------------|
| `npm run build:android` | Build do frontend para Capacitor + `cap sync android`                    |
| `npm run cap:sync`      | Só sincroniza `dist/` com o projeto Android (sem build)                  |
| `npm run cap:open:android` | Abre o projeto Android no Android Studio                             |
| `npm run android:apk`   | Build do frontend + sync + `gradlew assembleDebug` (requer Java/SDK)   |

## Estrutura após configuração

- **capacitor.config.ts** – Nome do app, `appId`, `webDir: "dist"`.  
- **android/** – Projeto Android (Capacitor). Pode ser versionado no Git.  
- **dist/** – Saída do `vite build`; é copiada para `android/app/src/main/assets/public` ao rodar `cap sync`.

---

## Página de download no site (https://donassistec.com.br/apk)

A rota **/apk** exibe uma página para baixar o app. O botão de download aponta para o arquivo **/DonAssistec.apk**.

Para o download funcionar em produção:

1. Gere o APK (por exemplo `app-debug.apk` em `android/app/build/outputs/apk/debug/`).
2. Copie o arquivo para a pasta **public** do frontend com o nome **DonAssistec.apk**:
   ```bash
   cp android/app/build/outputs/apk/debug/app-debug.apk public/DonAssistec.apk
   ```
3. Faça o deploy do frontend (incluindo `public/DonAssistec.apk`). O arquivo será servido em `https://donassistec.com.br/DonAssistec.apk`.

Recomendação: não versionar o APK no Git (ele é grande e muda a cada build). O `.gitignore` já ignora `public/DonAssistec.apk`; copie o APK no servidor durante o deploy ou use um job de CI.

### Nginx: fallback SPA para /apk (e outras rotas)

Em VPS, para **https://donassistec.com.br/apk** não retornar 404, o `nginx-vps.conf` inclui:

- **`proxy_intercept_errors on`** e **`error_page 404 = @spa`** na `location /`
- **`location @spa`**: em caso de 404 do frontend (porta 8200), o nginx pede `/` ao upstream e devolve o `index.html`, assim o React Router trata `/apk` e demais rotas do SPA.

Após alterar o nginx no servidor, recarregue: `sudo nginx -t && sudo systemctl reload nginx`. Veja também `DEPLOY.md` (seção Nginx como proxy reverso).

---

## Troubleshooting

Se algo falhar (por exemplo “JAVA_HOME is not set”), instale o JDK e/ou use o Android Studio para garantir que o SDK e as variáveis de ambiente estejam corretos.
