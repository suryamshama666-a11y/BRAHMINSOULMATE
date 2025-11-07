
import { toast } from "sonner";
import { Profile } from "@/data/profiles";
import { useNavigate } from "react-router-dom";

export function useHoroscopeFeatures(profile: Profile) {
  const navigate = useNavigate();

  const navigateToAstrologicalServices = () => {
    navigate("/astrological-services");
  };

  const handleBirthChartGeneration = () => {
    navigate("/astrological-services#birth-chart");
  };

  const handleKundaliMatching = () => {
    navigate("/astrological-services#kundali-matching");
  };

  const handleDoshaCheck = () => {
    navigate("/astrological-services#dosha-check");
  };

  const handleGunaMatching = () => {
    navigate("/astrological-services#guna-milan");
  };

  const handleAstrologerConsultation = () => {
    navigate("/astrological-services#video-consultation");
  };

  const handleAuspiciousTiming = () => {
    navigate("/astrological-services#auspicious-timing");
  };

  return {
    navigateToAstrologicalServices,
    handleBirthChartGeneration,
    handleKundaliMatching,
    handleDoshaCheck,
    handleGunaMatching,
    handleAstrologerConsultation,
    handleAuspiciousTiming
  };
}
