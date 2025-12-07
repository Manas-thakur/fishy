import FishAnimation from "@/components/FishAnimation";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center relative">
      <FishAnimation />
      <ThemeToggle />
      <main className="container">
        <h1 className="logo-text">Manas Kumar Thakur</h1>
        
        <div className="content">
          <p>I am an AI Engineer and Backend Developer based in New Delhi, India.</p>
          <p>I build intelligent systems using Machine Learning, Computer Vision, and modern web technologies to solve real-world problems.</p>
          <p className="contact-info">
            For more information, please visit my{" "}
            <a href="https://github.com/Manas-thakur">GitHub</a>,{" "}
            <a href="https://www.linkedin.com/in/manasthakur30">LinkedIn</a>, or contact{" "}
            <span className="email">thakurmanas168@gmail.com</span>
          </p>
        </div>
      </main>
    </div>
  );
}
