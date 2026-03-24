import { Cpu, CheckCircle } from "lucide-react";

const AuthoritySection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Image/Video placeholder */}
          <div className="relative rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center shadow-md">
            <div className="text-center p-8">
              <Cpu className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="font-heading font-bold text-lg text-foreground">
                Maquinário de Última Geração
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Espaço para imagem ou vídeo do laboratório
              </p>
            </div>
          </div>

          {/* Text */}
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6">
              Tecnologia Exclusiva no{" "}
              <span className="text-primary">Rio Grande do Sul</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
              Na Don Tech, não substituímos sua tela por uma peça genérica.
              Usamos máquinas de precisão industrial para reconstruir o vidro
              original do seu celular, preservando a qualidade de fábrica —
              sensibilidade ao toque, cores e brilho originais.
            </p>
            <ul className="space-y-3">
              {[
                "Preservamos a peça original do seu aparelho",
                "Equipamentos importados de alta precisão",
                "Processo 100% controlado em ambiente limpo",
                "Economia de até 70% comparado à troca completa",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm md:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthoritySection;
