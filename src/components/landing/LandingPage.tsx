import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShaderGradient, ShaderGradientCanvas } from 'shadergradient';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const AspireExamineLogo = ({ theme }: { theme: string }) => (
    <svg className={`h-12 w-12 sm:h-16 sm:w-16 ${theme === 'light' ? 'text-[#1E90FF]' : 'text-white'}`} fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path 
        clipRule="evenodd" 
        d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" 
        fill="currentColor" 
        fillRule="evenodd"
      />
    </svg>
  );

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

export const LandingPage = ({ onGetStarted, onLogin, onSignup }: LandingPageProps) => {
  const { theme } = useTheme();

  const lightThemeShader = "https://www.shadergradient.co/?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.2&cAzimuthAngle=180&cDistance=2.9&cPolarAngle=120&cameraZoom=1&color1=%23527aff&color2=%23faf7ff&color3=%23b0cdff&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=1.4&positionX=0&positionY=1.8&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=-90&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=0.3&uFrequency=5.5&uSpeed=0.2&uStrength=1.4&uTime=0.2&wireframe=false";
  const darkThemeShader = "https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1&cAzimuthAngle=180&cDistance=1.9&cPolarAngle=80&cameraZoom=9.1&color1=%23606080&color2=%238d7dca&color3=%23212121&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=0.8&positionX=0&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=50&rotationY=0&rotationZ=-60&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.4&uFrequency=0&uSpeed=0.1&uStrength=0.9&uTime=8&wireframe=false";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full text-foreground overflow-hidden p-4">
      <ShaderGradientCanvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      >
        <ShaderGradient
          control="query"
          urlString={theme === 'light' ? lightThemeShader : darkThemeShader}
        />
      </ShaderGradientCanvas>
      
      <div className="absolute top-4 right-4 flex gap-2 z-20 items-center">
        <Button size="sm" variant="ghost" onClick={onLogin} className={`text-xs sm:text-sm ${theme === 'light' ? "text-black hover:bg-white/10" : "text-white hover:bg-white/10"}`}>Log In</Button>
        <Button size="sm" onClick={onSignup} className={`text-xs sm:text-sm ${theme === 'light' ? "bg-blue-400 text-black hover:bg-blue-500" : "bg-blue-500 text-white hover:bg-blue-600"}`}>Sign Up</Button>
        <ThemeToggle size="sm"/>
      </div>

      <motion.div 
        className="z-10 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <AspireExamineLogo theme={theme}/>
        <h1 className={`mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter ${theme === 'light' ? 'text-[#1E90FF]' : 'text-white'}`}>
          AspireExamine
        </h1>
        <p className={`mt-3 sm:mt-4 max-w-xs sm:max-w-sm md:max-w-md text-sm sm:text-base ${theme === 'light' ? 'text-black' : 'text-gray-300'}`}>
          Your ultimate platform for exam preparation and success.
        </p>
        <Button 
          onClick={onGetStarted}
          className={`mt-6 sm:mt-8 font-bold text-base px-6 py-3 rounded-full transition-transform transform hover:scale-105 ${theme === 'light' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
          Get Started
        </Button>
      </motion.div>
    </div>
  );
};
