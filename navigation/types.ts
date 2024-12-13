export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
  DestinationDetail: { destination: string };
  Home: undefined;
  Destinations: undefined;
};

export type Location={
  latitude:number;
  longitude: number;
}

export type Destination = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  location: Location;
  tips?: string;
  howToReach?: string;
}


export interface Activity{
  time: string;
  description: string;
}

export interface Itinerary {
  id?: string;
  userId: string;
  destinationId: string; // Reference to a destination
  startDate: string; // ISO string format
  endDate: string; // ISO string format
  destination?: Destination; 
  activities: Activity[];
}

