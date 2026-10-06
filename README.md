# Convivência — Sistema de ocorrências escolares

Aplicação responsiva em HTML, CSS e JavaScript puro para registrar e acompanhar ocorrências escolares em computadores e celulares.

## Como usar

Abra `index.html` em um navegador moderno. Para iniciar a prévia sem dependências, execute `node preview-server.js`; o terminal exibirá o endereço local e o endereço de rede para outros aparelhos conectados ao mesmo Wi-Fi. Se necessário, permita o acesso do Node.js à rede privada no Firewall do Windows. Para escolher outra porta, defina `PORT` antes de iniciar.

O servidor é apenas para demonstração em rede local e não deve ser exposto à internet. Cada navegador continua guardando seus próprios registros e contas; não há sincronização entre aparelhos.

## Publicação

O workflow do GitHub Pages publica somente `index.html`, `app.js`, `styles.css` e `school-welcome.svg`. Depois de habilitar Pages para o repositório com origem **GitHub Actions**, execute o workflow **Publish school occurrence app** para publicar. A disponibilidade de Pages para um repositório privado depende do plano do GitHub.

## Recursos

- Painel com indicadores, registros recentes e distribuição das ocorrências.
- Cadastro, edição, consulta, acompanhamento, conclusão e exclusão de registros.
- Busca e filtros por estudante, turma, tipo e status.
- Login local, criação inicial da conta da coordenação, cadastro de professores pela coordenação e botão para sair.
- Validação de senha com letra maiúscula, minúscula, número, caractere especial e mínimo de oito caracteres.
- Relatório resumido e exportação dos registros em CSV.
- Layout adaptável a telas pequenas e navegação móvel.
- Dados mantidos no armazenamento local do navegador; não há servidor ou sincronização entre dispositivos.

O aplicativo inicia com alguns registros demonstrativos, que podem ser editados ou removidos. Para começar sem eles, limpe o armazenamento local do navegador para este site.

## Privacidade

Esta versão é um protótipo local: contas e dados não são enviados a um servidor e não são compartilhados entre usuários ou dispositivos. As senhas são derivadas com PBKDF2 antes de serem armazenadas, mas a autenticação e o controle de acesso acontecem inteiramente no navegador e não protegem os registros contra alguém com acesso ao dispositivo. Não use dados pessoais reais de estudantes em dispositivos compartilhados; uma implantação escolar precisa de autenticação, autorização, proteção de dados e armazenamento seguro no servidor.
