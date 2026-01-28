
# 🚀 Guia de Correção ChatFic AI (Android Studio)

Se o Android Studio abrir "vazio" ou sem o elefante do Gradle ativo, siga estes passos:

1. **FECHE** o Android Studio completamente.
2. **APAGUE** a pasta `android` no seu VS Code (botão direito -> delete).
3. **LIMPE O BUILD**: No terminal, rode `rm -rf dist` ou delete a pasta `dist`.
4. **GERA O SITE NOVO**: `npm run build`
5. **CRIA O APP DE NOVO**: `npx cap add android`
6. **SINCRONIZA**: `npx cap sync`
7. **ABRA**: `npx cap open android`

### No Android Studio (IMPORTANTE):
- Olhe para o rodapé (barra inferior). Se houver algo carregando, **ESPERE**.
- Se ele pedir para atualizar o "Gradle Plugin", clique em **OK** ou **Update**.
- O botão de "Play" (triângulo verde) só aparece depois que o carregamento no rodapé termina.
