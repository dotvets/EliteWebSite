import { ArrowRight } from "lucide-react";
import introImage from "@assets/generated_images/Veterinarian_holding_small_dog_1111faba.png";

export default function IntroSection() {
  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src={introImage}
              alt="Veterinarian with dog"
              className="rounded-xl shadow-lg w-full h-auto"
              data-testid="img-intro"
            />
          </div>
          <div>
            <h2
              className="text-3xl lg:text-4xl font-bold font-heading text-primary mb-4"
              data-testid="text-intro-title"
            >
              Welcome to Elite Vet
            </h2>
            <p className="text-xl text-muted-foreground mb-6 font-heading">
              Your trusted pet veterinary clinic
            </p>
            <p className="text-base text-foreground leading-relaxed mb-8">
              We are committed to providing top-quality care for your pets. Our
              veterinary clinic offers a wide range of services, including routine
              check-ups, vaccinations, surgeries, & dental care, using the latest
              technology & under the care & expertise of the best veterinarians in
              KSA.
            </p>
            <a
              href="/about"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              data-testid="link-read-more"
            >
              Read More
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
