import Link from "next/link";
import { ArrowRight, Globe2, LineChart, FlaskConical, TrendingUp, Zap, Target, Shield } from "lucide-react";

const features = [
  {
    title: "Global Tracking",
    description: "Monitor biodiversity decline and recovery through real-time telemetry across 5,000+ species.",
    icon: Globe2,
    color: "from-[#63e6be] to-[#6faef8]",
  },
  {
    title: "Scientific Narratives",
    description: "Transform complex metrics into actionable insights with context-aware ecological interpretation.",
    icon: FlaskConical,
    color: "from-[#6faef8] to-[#63e6be]",
  },
  {
    title: "Predictive Models",
    description: "Forecast population trajectories with integrated classifiers and advanced time-series analysis.",
    icon: LineChart,
    color: "from-[#ffb29f] to-[#63e6be]",
  },
  {
    title: "Intelligent Search",
    description: "RAG-powered queries uncover hidden patterns and correlations in biodiversity data.",
    icon: Zap,
    color: "from-[#63e6be] to-[#ffb29f]",
  },
];

const stats = [
  { label: "Species Tracked", value: "5,800+" },
  { label: "Regions Analyzed", value: "190+" },
  { label: "Data Points", value: "2.1M+" },
  { label: "Forecast Accuracy", value: "94.2%" },
];

export default function LandingPage() {
  return (
    <main className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: "url('/assets/image.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Content Container at Bottom */}
        <div className="relative px-8 md:px-16 py-16 md:py-24 max-w-3xl z-10 animate-fade-in">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight animate-slide-up">
              EcoDynamix
            </h1>
            <p className="text-white text-base md:text-lg italic font-light leading-relaxed max-w-lg animate-slide-up animation-delay-100">
              Modelling global wildlife population dynamics: A higher order computational assessment of species decline
            </p>
            <p className="text-white text-sm md:text-base font-light opacity-90 animate-slide-up animation-delay-200">
              Presented by Sarvan, Santhosh & Manish
            </p>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 animate-slide-up animation-delay-300">
              <Link
                href="/dashboard"
                className="px-7 py-3 bg-white text-[#0b1a24] font-semibold rounded-lg hover:bg-gray-100 hover:shadow-xl hover:shadow-white/20 transform hover:-translate-y-1 transition-all duration-300 text-sm md:text-base"
              >
                Explore Now
              </Link>
              <Link
                href="/species"
                className="px-7 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#0b1a24] hover:shadow-xl hover:shadow-white/20 transform hover:-translate-y-1 transition-all duration-300 text-sm md:text-base"
              >
                View Species
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-8 md:px-16 py-16 md:py-24 bg-[#0a1420]">
        <div className="max-w-full">
          <div className="space-y-6 mb-16 animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-bold text-white animate-slide-down">
              Powerful Capabilities
            </h2>
            <p className="text-gray-300 text-lg md:text-xl max-w-3xl animate-slide-down animation-delay-100">
              Integrated tools designed for researchers, policy makers, and conservation leaders
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group relative animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Glassmorphic Card */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl p-8 md:p-10 border border-white/20 hover:border-white/40 transition-all duration-500 hover:bg-white/15 transform group-hover:scale-105">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-[#0a1420]" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed text-base md:text-lg">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="relative px-8 md:px-16 py-16 md:py-24 bg-[#0a1420] overflow-hidden">
        <div className="max-w-full">
          <div className="space-y-12 animate-fade-in">
            <div className="space-y-4 animate-slide-up">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Built for Impact
              </h2>
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
                EcoDynamix is designed for mixed audiences: research teams seeking rigorous analysis, policy makers requiring strategic foresight, and climate operators managing urgent conservation priorities.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 pt-8">
              {[
                { icon: Target, title: "Precision", desc: "94.2% forecast accuracy" },
                { icon: TrendingUp, title: "Real-Time", desc: "Live biodiversity metrics" },
                { icon: Shield, title: "Evidence-Based", desc: "ML-powered insights" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {/* Glassmorphic Card */}
                    <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500 hover:bg-white/15 transform hover:-translate-y-2">
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-white/30 to-white/10 border border-white/20 flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-300 text-base md:text-lg">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative px-8 md:px-16 py-16 md:py-24 bg-[#0a1420] overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-1000" />

        <div className="relative max-w-full space-y-8 z-10 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold text-white animate-slide-up">
            Ready to Transform Conservation?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed animate-slide-up animation-delay-100 max-w-3xl">
            Join researchers and policy makers in understanding global biodiversity decline with unprecedented clarity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 animate-slide-up animation-delay-200 w-fit">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-lg bg-white text-[#0a1420] font-bold hover:bg-gray-100 hover:shadow-2xl hover:shadow-white/30 transform hover:-translate-y-1 transition-all duration-300 text-base md:text-lg"
            >
              Start Exploring
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 rounded-lg backdrop-blur-sm border-2 border-white text-white font-bold hover:bg-white hover:text-[#0a1420] hover:shadow-2xl hover:shadow-white/30 transform hover:-translate-y-1 transition-all duration-300 text-base md:text-lg"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Add custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-down {
          animation: slideDown 0.6s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </main>
  );
}
