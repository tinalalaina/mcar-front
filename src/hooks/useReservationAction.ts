import { useNavigate } from "react-router-dom";

type ReservationActionOptions = {
  isReservable?: boolean;
};

export const useReservationAction = () => {
  const navigate = useNavigate();

  const handleReserve = (
    vehicleId: string,
    options?: ReservationActionOptions
  ) => {
    if (!vehicleId) return;

    if (options?.isReservable === false) {
      navigate(`/vehicule/${vehicleId}`);
      return;
    }

    navigate(`/vehicule/${vehicleId}`);
  };

  return { handleReserve };
};