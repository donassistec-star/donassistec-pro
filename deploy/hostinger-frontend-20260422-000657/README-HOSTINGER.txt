Pacote de deploy do frontend DonAssistec

Como implantar no Hostinger:
1. Abra o Gerenciador de Arquivos da Hostinger.
2. Entre na pasta public_html do dominio.
3. Envie este arquivo ZIP para public_html.
4. Extraia o ZIP dentro de public_html.
5. Confirme que index.html, assets/, .htaccess e os demais arquivos ficaram direto em public_html.

Observacoes:
- Este pacote contem apenas o frontend compilado.
- O arquivo .htaccess faz o fallback do React Router para index.html.
- Se sua API/backend estiver em outro servidor, mantenha a configuracao de /api apontando para ele.
