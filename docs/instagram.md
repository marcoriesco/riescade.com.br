# Estúdio Instagram RIESCADE

Painel: `/admin/instagram`. Usa a sessão Supabase do site e uma lista explícita de UUIDs administrativos. Nenhum assinante recebe acesso automaticamente. A interface pública do painel não contém dados; as APIs verificam a sessão e a autorização em cada requisição.

## O que está implementado

- Instagram Login, vinculado ao navegador iniciador por cookie HttpOnly com estado aleatório, autenticado e expirável.
- Conta única, limitada a `INSTAGRAM_EXPECTED_USERNAME` (padrão `riescade`).
- Token criptografado com AES-256-GCM; somente servidor e service role acessam o banco.
- Upload de PNG/JPG/WebP estático até 3 MB, convertido em JPEG 1080 × 1350 com margens quando necessário, sem cortar a arte. O arquivo resultante fica público para a Meta poder buscá-lo. Não envie arquivos confidenciais.
- Legenda, prévia, rascunho, agendamento, cancelamento e histórico dos últimos 100 registros.
- Horário informado explicitamente em Brasília/São Paulo (UTC−03). Persistência em UTC.
- Worker autenticado: processa no máximo um post por chamada, somente agendados e vencidos. Reutiliza o container enquanto a Meta prepara a imagem.
- Renovação do token próximo ao vencimento, quando o agendador estiver ativo.

Esta versão publica somente imagens individuais no feed. Não inclui Reels, Stories, carrosséis, métricas, edição de posts existentes ou geração diária autônoma de artes. Rascunhos podem ser carregados no formulário para criar um agendamento; o rascunho original é preservado e pode ser cancelado.

## Configuração e ativação

1. Aplicar a migração `supabase/migrations/20261022223109_instagram_publisher.sql` no ambiente desejado, pelo fluxo de migrações do projeto. Foi validada em Postgres local via PGlite; não foi aplicada em produção. As tabelas têm RLS, sem políticas para clientes, com privilégios revogados para anon/authenticated. O bucket é público para leitura, sem política de escrita para clientes.
2. Definir `SOCIAL_ADMIN_USER_IDS` com o UUID da sua conta em Supabase Auth. Não usar e-mail, metadados editáveis ou ID do Instagram.
3. Cadastrar um app no Meta for Developers e configurar o produto **Instagram API com Instagram Login**. A conta precisa ser profissional (Empresa/Criador). Usar o ID e secret do produto Instagram em `INSTAGRAM_APP_ID` e `INSTAGRAM_APP_SECRET`.
4. Configurar uma versão suportada no painel da Meta em `INSTAGRAM_GRAPH_VERSION`, no formato `vNN.N`. Não foi fixada uma versão presumida.
5. Cadastrar exatamente a URL de redirecionamento: `https://www.riescade.com.br/api/admin/instagram/callback`. `NEXTAUTH_URL` deve ter o mesmo domínio HTTPS. Em outro ambiente, trocar o domínio em ambos os lugares. Configurar as URLs de privacidade/termos e exclusão de dados exigidas pelo painel da Meta. Revisão e nível de acesso dependem do uso e dos papéis das contas no app.
6. Solicitar `instagram_business_basic` e `instagram_business_content_publish`. Não são solicitadas permissões para mensagens ou comentários. Verificar o fluxo no modo de teste/papéis do app antes da ativação pública.
7. Gerar separadamente dois segredos com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`: um para `INSTAGRAM_TOKEN_ENCRYPTION_KEY` e outro para `INSTAGRAM_CRON_SECRET`. Guardar só nas variáveis do servidor. Trocar a chave de criptografia invalida os tokens salvos: reconectar depois.
8. Publicar o código mantendo `INSTAGRAM_PUBLISHING_ENABLED=false`. Entrar no site com a conta administrativa e abrir `/admin/instagram`. Clicar em Conectar Instagram e autorizar **@riescade**. Login/CAPTCHA/aceite de termos devem ser feitos pelo proprietário. Não enviar credenciais pelo chat.
9. Configurar um agendador de servidor para chamar `GET https://www.riescade.com.br/api/internal/instagram/publish` a cada 5 minutos, com header `Authorization: Bearer <INSTAGRAM_CRON_SECRET>`. Usar o cofre de segredos do agendador, nunca query string ou repositório. Vercel Cron também pode ser usado conforme limites do plano, mas injeta `CRON_SECRET`: nesse caso configurar `CRON_SECRET` com o mesmo valor de `INSTAGRAM_CRON_SECRET`. Não foi alterado `vercel.json` nem criado serviço externo pago.
10. Após conferir conexão, imagem e legenda, habilitar `INSTAGRAM_PUBLISHING_ENABLED=true` e agendar um post de teste aprovado. Conferir o histórico e o Instagram. Só então preparar o restante da semana.

O horário é aproximado pela frequência do agendador e pelo processamento da Meta. Cada chamada processa um item. Monitorar chamadas com estado `expired`, `disconnected` ou falhas; o sistema não envia alertas externos. Se o cron parar, publicações vencidas permanecem na fila e podem sair ao retomá-lo; cancelar as que não devem mais sair antes de retomar.

## Falhas e prevenção de duplicação

A disputa entre workers usa uma atualização condicional por status e contador de tentativas. Apenas um consegue reclamar o mesmo item. Antes de `media_publish`, o registro entra em `uncertain`. Se houver timeout, queda do processo ou falha ao gravar a confirmação, **não há reenvio automático**. Registros abandonados em `processing` por 10 minutos também entram em conferência. Verificar o perfil antes de preparar outro post; isso evita duplicar uma publicação que a Meta aceitou sem devolver resposta.

Falhas antes da publicação viram `failed`. Containers em preparação são revisitados em chamadas futuras, por até 30 tentativas. Registros em conferência não podem ser reagendados pela interface. Não há exclusão de histórico ou arquivos pelo painel nesta versão.

## Verificação local

`npm run typecheck`

`npm test -- src/lib/server/instagram-security.test.ts src/lib/server/instagram.database.test.ts src/lib/server/instagram-worker.test.ts`

`npm run lint`

Testes reais contra a Meta exigem app/configuração/autorização do proprietário; os testes automatizados usam provedor simulado e Postgres local, sem publicar conteúdo.

Referências: https://www.postman.com/meta/instagram/folder/6raa77c/instagram-api-with-instagram-login e https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing .
