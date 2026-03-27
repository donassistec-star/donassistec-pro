import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Download, Shield, Wifi, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const APK_URL = "/DonAssistec.apk";
const APK_FILENAME = "DonAssistec.apk";

const ApkDownload = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary to-primary/80 py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              App Android
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Baixe o app DonAssistec
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8">
              Acesse catálogo, pedidos e orçamentos pelo celular. App oficial para lojistas e assistências técnicas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href={APK_URL} download={APK_FILENAME}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 text-lg px-8 py-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  <Download className="w-6 h-6" />
                  Baixar APK para Android
                </Button>
              </a>
              <Link to="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar ao site
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Conteúdo */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-primary" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center">O que você pode fazer no app</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="p-6 flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Wifi className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Catálogo e orçamentos</h3>
                      <p className="text-sm text-muted-foreground">
                        Consulte modelos, peças e solicite orçamentos direto pelo celular.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Seguro e oficial</h3>
                      <p className="text-sm text-muted-foreground">
                        App desenvolvido pela DonAssistec. Mesma conta do site.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Requisitos</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Android 5.1 (API 22) ou superior</li>
                    <li>Para instalar: permita “Fontes desconhecidas” nas configurações do Android, se solicitado</li>
                    <li>Recomendado usar a mesma conta (e-mail) que você usa no site</li>
                  </ul>
                </CardContent>
              </Card>

              <p className="text-center text-sm text-muted-foreground">
                Ao baixar, você concorda com nossos{" "}
                <Link to="/termos" className="text-primary underline hover:no-underline">
                  Termos de Uso
                </Link>{" "}
                e{" "}
                <Link to="/privacidade" className="text-primary underline hover:no-underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default ApkDownload;
