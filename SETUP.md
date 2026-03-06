# Configuração do Ambiente - Quiz Educacional PWA

## Passos para Configurar o Supabase

1. **Crie o arquivo `.env.local` na raiz do projeto** (este arquivo é ignorado pelo git):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

2. **Obtenha suas credenciais do Supabase:**
   - Acesse seu projeto no painel do Supabase
   - Vá para Settings > API
   - Copie a **Project URL** e cole em `NEXT_PUBLIC_SUPABASE_URL`
   - Copie a **anon public key** e cole em `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Reinicie o servidor de desenvolvimento** após criar o arquivo `.env.local`

## Estrutura do Banco de Dados

O sistema trabalhará exclusivamente com as seguintes tabelas:

- `questionarios` - Questionários criados pelos professores
- `questoes` - Questões de cada questionário  
- `sessoes_aluno` - Sessões ativas dos alunos
- `respostas_alunos` - Respostas dos alunos

## Captura de ID do Aluno

O ID do aluno pode ser capturado de duas formas:
1. Via parâmetro URL: `?aluno_id=12345`
2. Via input de fallback (será implementado na próxima fase)

## Próximos Passos

Após configurar as variáveis de ambiente, o sistema estará pronto para:
- Implementar o motor offline-first com IndexedDB
- Criar a lógica de recuperação de estado
- Desenvolver a fila de sincronização com Supabase
