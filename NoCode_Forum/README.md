# Criando um fórum com Excel + Google AppSheet

1. Introdução
2. Setup Inicial
3. INFO - Informações do APP
4. DATA - Lógica de tabelas
5. UX - Identidade do app
6. BEHAVIOR - Ações configuráveis
7. SECURITY - Opções de segurança
8. Conclusão

## Introdução
Este mostra como eu montei um aplicativo num estilo fórum (com posts, comentários e até uma seção de wiki) usando apenas uma planilha do Excel como banco de dados e o Google AppSheet como plataforma de criação do app. A ideia era simular algo como um reddit ou 4chan.
O diferencial dessa abordagem é que **não existe sistema de login ou registro de usuários**: qualquer pessoa que acesse o app pode ver os posts, comentar e curtir, sem precisar criar conta. Isso simplifica bastante a criação (e o custo, já que o AppSheet cobra por usuários autenticados) e é ideal para comunidades pequenas, fã-clubes, wikis colaborativas ou murais informativos.

No guia vamos passar por todas as etapas: da estrutura da planilha até a configuração de views, ações e segurança dentro do AppSheet.

### O que é o AppSheet
O AppSheet é uma plataforma no-code da Google que transforma uma fonte de dados (planilhas do Google Sheets, Excel, bancos de dados, etc.) em um aplicativo funcional com telas, formulários, botões e regras de comportamento sem escrever código.

## Setup inicial

Antes de criar o app propriamente dito, é preciso montar a planilha que vai servir de banco de dados. Ela é bem simples: apenas colunas e linhas, sem fórmulas, já que o AppSheet lida com a lógica depois. Pra isso criei uma planilha no google sheets.
 
<img width="1919" height="1077" alt="image" src="https://github.com/user-attachments/assets/e0a261bb-a828-4afd-a0a7-a1834ee4dea5" />
 
A planilha tem três tabelas (na prática, três Páginas dentro do mesmo arquivo): **Posts**, **Comentários** e **Wiki**.

### Tabela Posts
 
<img width="831" height="221" alt="image" src="https://github.com/user-attachments/assets/56b913bd-eaf0-4ce9-abf2-93f2f0eeda87" />
 
|Coluna|Descrição|
|---|---|
|PK_Post|Chave primária do post|
|IsFixed|Indica se o post está fixado|
|Title|Título do post|
|CreationTime|Data e hora de criação|
|FavoriteCount|Contagem de favoritos|
|Tag|Categoria/etiqueta do post|
|Content|Conteúdo do post|

### Tabela Comentários
 
<img width="960" height="246" alt="image" src="https://github.com/user-attachments/assets/9dc26cbc-c598-4733-b91a-599138f9d1ee" />

 
|Coluna|Descrição|
|---|---|
|PK_Comments|Chave primária do comentário|
|FK_Post|Chave estrangeira, referencia o post ao qual o comentário pertence|
|Content|Texto do comentário|
|DateTime|Data e hora da criação|
|LikeCount|Contagem de curtidas|
|ModCheck|Sinalização de moderação|

### Tabela Wiki

<img width="960" height="248" alt="image" src="https://github.com/user-attachments/assets/1cddff48-e633-4a71-b6b3-e38f97a3451e" />


|Coluna|Descrição|
|---|---|
|PK_Wiki|Chave primária da entrada da wiki|
|Nome|Nome da entrada|
|Grupo|Grupo ao qual pertence|
|Notas|Observações/notas adicionais|
|Image|Imagem da entrada|
|Tag|Categoria/etiqueta|
|Starred|Marcação de destaque/favorito|

Com essas três tabelas prontas na planilha, ela já está pronta para ser conectada ao AppSheet.

### Criando um app

Para começar, acesse [appsheet.com](https://appsheet.com), entre com uma conta Google e escolha a opção de criar um novo app a partir de dados existentes (nesse caso, a planilha Excel que vamos montar no próximo passo).

<img width="960" height="380" alt="image" src="https://github.com/user-attachments/assets/7dfdfcd9-cf8c-4d2b-88aa-81ba8d8c5038" />

Feito isso, dê um nome ao app, uma categoria e depois é só selecionar sua Planilha do Google.

<img width="915" height="600" alt="image" src="https://github.com/user-attachments/assets/3a3538e7-b52b-408e-b282-fa3fe4c6899e" />

O App Sheets vai importar sua planilha (o que pode demorar um pouco) e agora podemos configurar a planilha.

### Interface
Ao entrar em um app, marcado em vermelho você verá um menu lateral com as principais abas de configuração (Info, Data, UX, Automation, Behavior, Security etc.), e em verde ao centro/direita, uma prévia em tempo real de como o app está ficando; qualquer alteração nas abas reflete imediatamente nessa prévia.

<img width="1920" height="1079" alt="image" src="https://github.com/user-attachments/assets/bffc881e-4aeb-430e-bfb6-a63ae00a4da2" />

## Aba "Info"

### Sobre a aba

A aba Info é onde ficam as configurações gerais e de identidade do app — o "documento de identidade" dele dentro do AppSheet. Você vai iniciar na Dashboard, mas de início não vamos mexer em nada por aqui.

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/b24ba3c7-b0f2-40dd-b527-0f96ca9c6cc3" />

### Propriedades

Aqui você define:

- Nome curto do app
- Versão
- Descrição curta
- Categoria, função e indústria

<img width="1910" height="885" alt="image" src="https://github.com/user-attachments/assets/40a378e0-23fa-4147-893f-82f3dabe0a83" />

Em **Information for App Users**, coloque qualquer informação que considere relevante para quem for usar o app, esse texto fica visível para os usuários dentro do próprio aplicativo. (Na seta em azul temos o menu hambúrguer do app para checar melhor essas funções).

<img width="414" height="372" alt="image" src="https://github.com/user-attachments/assets/bbaf5797-b597-4189-b748-a6b0e43705ba" />

<img width="1913" height="719" alt="image" src="https://github.com/user-attachments/assets/8cd6be5c-5973-408c-a829-d870688704e7" />

### Spec

Essa seção mostra um gráfico com as funcionalidades do app e como elas se conectam/visualizam entre si. A versão final deve se parecer com isso:

> 📌 **IMAGEM/GRÁFICO:** captura do gráfico de Spec gerado pelo AppSheet com as funcionalidades do app.

## Aba "Data"

É aqui que o AppSheet efetivamente lê e organiza os dados vindos da planilha. É uma das abas mais importantes, pois qualquer erro de leitura de coluna ou tipo de dado nesta etapa vai se propagar para o resto do app.

<img width="1910" height="1068" alt="image" src="https://github.com/user-attachments/assets/be89ccee-362b-413c-8e09-676ce034e370" />

### Tables

As três tabelas (Comments, Posts e Wiki) devem ser importadas, todas vindas da mesma planilha. Para cada uma, é preciso definir:

- **Nome** da tabela dentro do app
- **Update behavior** (como o AppSheet deve tratar leitura/escrita/adição de dados)

A princípio, todas as tabelas devem estar assim:

<img width="1356" height="235" alt="image" src="https://github.com/user-attachments/assets/bab0f28a-20c0-4411-9751-b6a0dbbf1cfb" />

### Columns

Depois de importar, é essencial checar se todas as colunas foram reconhecidas corretamente pelo AppSheet — tipo de dado (texto, número, data, imagem etc.) e nome de cada uma.

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/62a9deb3-a159-4657-93ae-63c13d830212" />

Configure as colunas de acordo com sua necessidade, adicionando o que for relevante pro seu caso. Algumas coisas já vão vir automáticamente (usamos a disposição e alguns nomes justamente por isso.) 

#### CONFIGURAÇÃO da tabela POSTS

<img width="1299" height="605" alt="image" src="https://github.com/user-attachments/assets/e3770478-f675-4deb-9c1c-f6f435e58020" />

Com isso feito, adicione três colunas virtuais:

<img width="1260" height="176" alt="image" src="https://github.com/user-attachments/assets/fa50a8cd-2ec5-40ef-98b7-1c8efc525b37" />

RelatedComments -> ```REF_ROWS("Comments", "FK_Post")```

LastestMessage -> ```MAX([RelatedComments][DateTime])``` 

MessagesAmmount ->```COUNT([RelatedComments])```

#### CONFIGURAÇÃO da tabela COMMENTS

<img width="1308" height="553" alt="image" src="https://github.com/user-attachments/assets/48aa3bad-55cb-4f24-838c-19145ca4f998" />

Ao definir o comentário FK_POST como Ref, defina assim:

<img width="864" height="765" alt="image" src="https://github.com/user-attachments/assets/ca490a89-3683-4604-a395-a3afeaacee0e" />

#### CONFIGURAÇÃO da tabela WIKI

<img width="1290" height="604" alt="image" src="https://github.com/user-attachments/assets/3acac8cc-0332-4c92-a76a-c1d82993a9ae" />


### Primeiras entradas

Salve, e na sua planilha do excel, adicione os seguintes em cada uma das suas tabelas, e então atualize o app:

#### POSTS

<img width="1290" height="600" alt="image" src="https://github.com/user-attachments/assets/e695fa25-7e18-4ac8-b758-23c6b29a3ed9" />

#### WIKI

<img width="783" height="87" alt="image" src="https://github.com/user-attachments/assets/d3effbd9-1bc6-4078-9640-0ed433d88ad6" />

Seu preview deve se parecer com isso agora:

<img width="342" height="713" alt="image" src="https://github.com/user-attachments/assets/cdb5279f-3f8e-4692-82ba-4c564f74a9cd" />

### Slices

Slices são "recortes" das tabelas originais que permitem criar visões filtradas dos dados sem duplicar a planilha. Por exemplo, uma slice pode mostrar apenas os posts fixados, ou apenas comentários que passaram pela moderação.

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/5d76de06-e68c-47fe-96d4-3ca2b7138f37" />

Pra que você tenha uma idéa do que é possivel ser feito:

1. Na aba Data, procure a seção **Slices**.
2. Crie uma nova slice a partir da tabela desejada (ex: Posts).
3. 
<img width="1362" height="762" alt="image" src="https://github.com/user-attachments/assets/7c87247d-bfce-43d5-8b10-209a45ac84eb" />
4. Defina a condição de filtro (ex: `[IsFixed] = TRUE`).
5. Escolha quais colunas ficam visíveis nessa slice.

<img width="1296" height="941" alt="image" src="https://github.com/user-attachments/assets/5e3d1470-e0d8-47fd-b723-429a783c7aad" />

As outras duas seções (User Settings e Options) não devem ser mexidas inicialmente. A menos que saiba o que está fazendo;
As configurações de Estruturas de dados do App estão prontas. Agora é uma questão apenas de deixar ele com "Cara de Fórum", e adaptar ele de acordo com suas necessidades.

## Aba UX

A aba UX é onde se define **o que o usuário efetivamente vê e como interage** com o app.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/44751a92-017f-4ce0-8b5b-eb36f7b25c12" />


### Views

#### Sobre a aba Views

Cada view representa uma "tela" do app. É possível ter várias views para a mesma tabela, cada uma com um propósito e um formato de exibição diferente (cards, deck, table, detail etc.).
As views são divididas em dois grandes grupos: **primárias** e **sistemas**. As de sistema são criadas automaticamente.

<img width="1299" height="986" alt="image" src="https://github.com/user-attachments/assets/cb857d00-7e3b-4a87-a7e1-b66cefa24997" />

#### Views primárias

São as views que ficam fixadas na parte inferior do app, de fácil acesso. 
Inicialmente você vai ter apenas a View de POSTS, configurada da seguinte forma:

<img width="1698" height="993" alt="image" src="https://github.com/user-attachments/assets/406a1eb2-af9a-49eb-a16d-561a22435690" />

Fique à vontade para testar e conhecer, explorar cada um dos diversos tipos de visão. Para um estilo mais parecido com o Reddit, escolha a opção "Card". Você via ver que inicialmente já vamos ter uima mudança no visual. Você pode alterar o "Position" caso queira colocar algo no Menu.

<img width="1683" height="632" alt="image" src="https://github.com/user-attachments/assets/dfc835b2-174f-41be-98df-6e20866bb981" />

Em "sort by", abaixo de "View Options", coloque Creation Time e Descending, para que os mais recentes fiquem no topo.

<img width="1248" height="864" alt="image" src="https://github.com/user-attachments/assets/81430c53-ef04-4a86-b904-b9b8e6316090" />

Para definir o Layout, gosto de deixar o header, a imagem, o subheader como None, o onclick como "go to details". 
Title como título, Subtitle como Hora de criação do post e o conteúdo como conteúdo. O resultado final vai ficar parecido com isso:

<img width="357" height="716" alt="image" src="https://github.com/user-attachments/assets/d23b7fd0-42c6-4ca9-8657-32af55781bb3" />

Por último, você pode definir o ícone da View.

<img width="831" height="464" alt="image" src="https://github.com/user-attachments/assets/503d0d6b-4e59-4897-9aca-f1776bf55a1c" />

Neste projeto, criei três views principais:
#### **Fixado** — mostra o post fixado, usando o formato **Detail**, position "First".

<img width="873" height="924" alt="image" src="https://github.com/user-attachments/assets/a06bfe94-800d-450e-bb1a-da033f5d25a0" />

A ordem de colunas decida manualmente, observando sempre seu preview. O meu coloquei assim:

<img width="843" height="912" alt="image" src="https://github.com/user-attachments/assets/ace60d56-e21e-4d1b-a449-01338e5ec82f" />

#### **Todos os posts** — mostra todos os posts, usando o formato **Calendar**, position "last"

As opções de visualização assim:

<img width="768" height="684" alt="image" src="https://github.com/user-attachments/assets/23250743-1f00-4e20-b4a7-820a624e10ea" />

E o resultado será algo parecido com isso:

<img width="363" height="699" alt="image" src="https://github.com/user-attachments/assets/aed93314-52cd-49ef-a17a-889fd98b1aaa" />

#### **Wiki** — mostra as entradas da Wiki, usando o formato **Deck**, position "menu"

Para as opções de View:

<img width="831" height="531" alt="image" src="https://github.com/user-attachments/assets/d2028d78-9a32-4ed6-bad9-5a7a969c4686" />
<img width="825" height="601" alt="image" src="https://github.com/user-attachments/assets/db1438c5-7e83-4dfb-b617-44abf3f047c8" />

E o resultado deve se parecer com isso:
<img width="342" height="594" alt="image" src="https://github.com/user-attachments/assets/65ba0d7f-5578-43fd-8835-ad188a0a9543" />

Com isso, a estrutura inical está pronta e pode praticamente se usar o app. Recomendo passar nas views de sistema, e editá-las como quiser, removendo a visibilidade de entradas que não quiser que sejam selecionadas, principalmente os "Form" que são formulários de inserção. para eles recomendo ocultar algumas. Isso pdoe ser feito acessando a coluna, e em editar desativar a opção "Show". As colunas comuns de se ocultar são "PK", "FK", CreationTime, FavoriteCount e IsFixed

<img width="867" height="330" alt="image" src="https://github.com/user-attachments/assets/e4bb0628-9329-4018-ad47-d1b6c45a160d" />

### Brand

Aqui fica o design geral do app: logo, imagem de splash/lançamento, cores principais, entre outras identidades visuais. Para mais detalhes sobre as opções de estilo, veja a documentação oficial: [support.google.com/appsheet?p=style](https://support.google.com/appsheet?p=style).

<img width="1698" height="894" alt="image" src="https://github.com/user-attachments/assets/88b411bd-3234-4aa7-942d-40b0e2334285" />

Pode escolher as cores e tema do app por aqui. Definir o ícone e etc. Como esse projeto é um Reddit "fake" para um servidor de RPG vou me basear nele para fazer os ícones e etc. Alterar isso aqui vai fazer seu app ter uma cara mais única e personalizada.

<img width="1697" height="905" alt="image" src="https://github.com/user-attachments/assets/2af059ba-dbeb-436b-964e-69c18f27013a" />

### Format rules

As Format Rules permitem aplicar formatações condicionais — cores, ícones, destaques — de acordo com o valor de uma coluna. Neste projeto, foram criadas regras para:

- **Moderação e título**: tanto na view de posts quanto na view de moderação, para destacar visualmente itens que precisam de atenção.
<img width="1251" height="477" alt="image" src="https://github.com/user-attachments/assets/c833e28d-1d6c-41ca-b40b-24c795fab369" />

<img width="1251" height="937" alt="image" src="https://github.com/user-attachments/assets/3dcdab91-89e4-484b-95c1-343240628861" />

Recomendo aumentar e diminuir os tamanhos das fontes de acordo com seus casos de uso.

<img width="335" height="596" alt="image" src="https://github.com/user-attachments/assets/48c7d1bf-561c-47a6-8d6f-52c2bb78194c" />


### Options

Nesta seção você define a visão inicial do app, fontes, tipos de formulário e outras configurações gerais; vale a pena ir testando as opções e observar o que fica melhor para o seu caso. É aqui também que se configura a visualização de:

- Detalhes
- Mapas
- Tabelas
- Inputs (formulários)
- Dashboards

### Localize

Seção onde é possível alterar palavras globais pré-definidas do app (por exemplo, termos padrão de botões e mensagens do sistema), adaptando-as ao idioma ou tom desejado.

## Aba Behavior

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/19c1ccb0-7b50-46bb-9792-bdda353e1833" />

A aba Behavior define as **ações** que os usuários podem executar dentro do app. Os "botões" que fazem algo acontecer.

### Actions

Neste projeto:

- Em **Posts**, foi criada uma ação de **"gostei"** que soma +1 ao contador de favoritos (FavoriteCount) e outra que leva o usuário para a **view de post expandido** (expanded post).
<img width="1290" height="822" alt="image" src="https://github.com/user-attachments/assets/fb3777a3-3a9a-42e6-8c89-f3ffb2cf2c6c" />
<img width="1287" height="638" alt="image" src="https://github.com/user-attachments/assets/b1bb32ca-a403-4c03-9c96-a468fe133452" />

- Em **Wiki**, foi adicionada uma ação de **estrelas**, para que os usuários demonstrem apreciação pelas entradas da wiki (usando a coluna Starred).
<img width="1299" height="837" alt="image" src="https://github.com/user-attachments/assets/ad31fd05-bfec-4d3f-acc4-afd62885bd8f" />

Pode ser necessário voltar na aba "UX" e configurar algumas ações.

### Offline sync

Praticamente todas as opções de sincronização offline ficam ativas, com exceção de **delta sync**, que foi desativada neste projeto.

## Aba Security

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/3f924d4c-72fd-46c2-98b9-f0a6dc277991" />

Aqui ficam as configurações de segurança e controle de acesso do app.

### Require sign in

Essa opção exige que os usuários façam login para usar o app. Como o objetivo aqui é justamente **não ter cadastro/login** (e evitar as taxas cobradas pelo AppSheet por usuário autenticado), essa opção **deve ficar desativada**.

<img width="654" height="638" alt="image" src="https://github.com/user-attachments/assets/759260b8-eb65-42c9-9481-ac509682adb6" />

### Demais opções

O restante das opções de segurança pode permanecer ativado normalmente, sem prejudicar o funcionamento do app sem login.

## Conclusão

Com isso, o app de fórum está completo: uma planilha simples servindo de banco de dados, três tabelas conectadas, views organizadas para posts, comentários e wiki, ações de interação (curtidas e estrelas) e tudo funcionando sem exigir cadastro do usuário.
