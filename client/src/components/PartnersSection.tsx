import { Card } from "@/components/ui/card";

export default function PartnersSection() {
  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl lg:text-4xl font-bold font-heading text-foreground mb-4"
            data-testid="text-partners-title"
          >
            Our Partners
          </h2>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8">
          <Card className="p-8 w-64 h-32 flex items-center justify-center hover-elevate">
            <div className="text-center">
              <p className="text-2xl font-semibold text-primary">Vest Van</p>
            </div>
          </Card>
          <Card className="p-8 w-64 h-32 flex items-center justify-center hover-elevate">
            <div className="text-center">
              <p className="text-2xl font-semibold text-primary">Elite Falcons</p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
