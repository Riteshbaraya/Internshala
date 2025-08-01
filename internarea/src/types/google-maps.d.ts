import { FC, ReactNode } from 'react';

declare module '@react-google-maps/api' {
  export interface GoogleMapProps {
    mapContainerStyle?: React.CSSProperties;
    center: google.maps.LatLngLiteral;
    zoom: number;
    options?: google.maps.MapOptions;
    children?: ReactNode;
  }

  export interface MarkerProps {
    position: google.maps.LatLngLiteral;
    children?: ReactNode;
  }

  export interface InfoWindowProps {
    position: google.maps.LatLngLiteral;
    children?: ReactNode;
  }

  export const GoogleMap: FC<GoogleMapProps>;
  export const Marker: FC<MarkerProps>;
  export const InfoWindow: FC<InfoWindowProps>;

  export function useJsApiLoader(options: {
    id: string;
    googleMapsApiKey: string;
    libraries?: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[];
  }): {
    isLoaded: boolean;
    loadError: Error | undefined;
  };
} 