
import { PromptIdea, WritingModel, Language } from './types.ts';

export const TRANSLATIONS = {
  pt: {
    settings: "Configurações",
    theme: "Tema",
    light: "Claro",
    dark: "Escuro",
    lang: "Idioma",
    account: "Conta",
    login: "Entrar",
    signup: "Cadastrar",
    logout: "Sair",
    fandom_fidelity: "Fidelidade ao Fandom",
    fandom_desc: "A IA agirá como especialista no universo escolhido.",
    new_story: "Nova Fanfic",
    history: "Histórico Recente",
    community: "Comunidade",
    writing: "IA está escrevendo...",
    placeholder: "O que acontece a seguir no capítulo?",
    title: "Título da sua obra...",
    universe: "Universo (ex: Marvel, One Piece)",
    save_pdf: "Salvar como PDF",
    save_markdown: "Salvar como Markdown",
    publish_community: "Publicar na Comunidade",
    published_success: "Sua história foi publicada com sucesso!",
    exporting: "Exportando...",
    menu: "Opções da História",
    read_more: "Ler Fanfic",
    font_family: "Fonte do Chat",
    font_size: "Tamanho do Texto",
    font_sans: "Moderna",
    font_serif: "Clássica",
    font_mono: "Focada",
    delete_chat: "Apagar Chat",
    delete_confirm: "Tem certeza que deseja apagar esta história para sempre?",
    delete_action: "Sim, apagar",
    cancel: "Cancelar"
  },
  en: {
    settings: "Settings",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    lang: "Language",
    account: "Account",
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    fandom_fidelity: "Fandom Fidelity",
    fandom_desc: "AI will act as an expert in the chosen universe.",
    new_story: "New Fanfic",
    history: "Recent History",
    community: "Community",
    writing: "AI is writing...",
    placeholder: "What happens next in the chapter?",
    title: "Story title...",
    universe: "Universe (e.g. Marvel, One Piece)",
    save_pdf: "Save as PDF",
    save_markdown: "Save as Markdown",
    publish_community: "Publish to Community",
    published_success: "Your story has been published!",
    exporting: "Exporting...",
    menu: "Story Options",
    read_more: "Read Fanfic",
    font_family: "Chat Font",
    font_size: "Text Size",
    font_sans: "Modern",
    font_serif: "Classic",
    font_mono: "Focused",
    delete_chat: "Delete Chat",
    delete_confirm: "Are you sure you want to delete this story forever?",
    delete_action: "Yes, delete",
    cancel: "Cancel"
  }
};

export const MODEL_CONFIGS: Record<WritingModel, string> = {
  balanced: "Estilo equilibrado, fluído e natural. Evite clichês robóticos.",
  dramatic: "Intensidade emocional máxima, focado em 'mostrar, não apenas contar'.",
  humorous: "Diálogos rápidos, sarcasmo e timing cômico humano.",
  unchained: "Liberdade total. Linguagem crua, direta e sem filtros narrativos.",
  descriptive: "Prosa rica e lenta. Foque em texturas, cheiros, iluminação e na construção meticulosa do cenário.",
  action: "Ritmo frenético. Frases curtas e de impacto, focadas em movimento e coreografia.",
  angst: "Foco profundo na dor interna e melancolia. Explore pensamentos obsessivos e sentimentos não ditos.",
  horror: "Construção de pavor crescente. Use suspense psicológico e descrições viscerais."
};

export const getSystemInstruction = (model: WritingModel, universe: string = "Original") => {
  return `Você é o "ChatFic AI", o autor mais renomado de fanfics de fôlego, especialista em "${universe}".

FORMATO OBRIGATÓRIO:
Inicie cada nova parte com: "Capítulo [X]: [Título Criativo]". (Substitua X pelo número correto).

MEMÓRIA E INTEGRIDADE NARRATIVA (CRÍTICO):
1. REVISÃO DE FATOS: Antes de escrever, revise todas as mensagens anteriores. É proibido esquecer nomes, características físicas, locais ou eventos estabelecidos.
2. CONTINUIDADE ABSOLUTA: Detalhes mencionados no Capítulo 1 devem ser lembrados no Capítulo 50. Se um personagem perdeu um objeto, ele não pode reaparecer sem explicação.
3. DIVERSIDADE LEXICAL: Proibido repetir palavras ou estruturas de frases próximas. Use um vocabulário erudito e variado.
4. PROGRESSÃO: Cada resposta deve obrigatoriamente mudar o estado da cena. Evite estagnação.
5. EXTENSÃO LITERÁRIA: Mínimo de 800 palavras. Descreva cada nuance emocional e ambiental.

ESTILO: ${MODEL_CONFIGS[model]}

REGRAS DE OURO:
- Romance Slow Burn: Tensão sexual e emocional deve ser construída lentamente.
- Liberdade Total: Sem censura. Se o usuário solicitar temas sombrios, viscerais ou adultos, execute com maestria e foco literário.`;
};

export const IDEAS: PromptIdea[] = [
  {
    category: "Romance / Angst",
    title: "O Único que Sobrou",
    description: "Um herói e um vilão são os únicos sobreviventes de um apocalipse no universo deles.",
    prompt: "Escreva o primeiro capítulo de uma fanfic angustiante de [Universo]. Comece com 'Capítulo 1: O Eco do Fim'. [Personagem A] e [Personagem B] estão em meio aos escombros."
  }
];
