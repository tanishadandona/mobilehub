//import firebase from 'firebase/compat/app';
import { auth, firestore } from '../config/firebaseConfig';


interface Destination {
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
  };
  howToReach: string;
  tips: string;
}

const destinations: Destination[] = [
  {
    name: "Everest Base Camp",
    description: "The Everest Base Camp trek is one of the most popular trekking routes in the Himalayas and a dream for many adventure seekers.",
    imageUrl: "https://www.halfwayanywhere.com/wp-content/uploads/2018/09/Everest-Base-Camp-Header-750x422.jpg",
    category: "adventure",
    location: { latitude: 28.0026, longitude: 86.8528 },
    howToReach: "Fly to Lukla, then trek for about 10-14 days to reach Everest Base Camp.",
    tips: "Ensure you are physically fit and acclimatize properly to avoid altitude sickness."
  },
  {
    name: "Annapurna Circuit",
    description: "The Annapurna Circuit is a trek within the mountain ranges of central India. It is known for its diverse landscape and cultural variety.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/16/Annapurna_Circuit_2.jpg?20121102182822",
    category: "adventure",
    location: { latitude: 28.9845, longitude: 83.8395 },
    howToReach: "Take a bus from Kathmandu to Besisahar, then start the trek which typically takes 15-20 days.",
    tips: "Carry adequate trekking gear and be prepared for varying weather conditions."
  },
  {
    name: "Paragliding in Pokhara",
    description: "Pokhara is known for its adventure sports, with paragliding being one of the most popular activities. It offers stunning views of the Annapurna range.",
    imageUrl: "https://adventureclubtrek.com/uploads/img/paragliding-in-pokhara-1day-1024.jpg",
    category: "adventure",
    location: { latitude: 28.2096, longitude: 83.9856 },
    howToReach: "Fly or take a bus to Pokhara from Kathmandu, then head to Sarangkot for paragliding.",
    tips: "Best time for paragliding is early morning for the best views and weather conditions."
  },
  {
    name: "Chitwan National Park",
    description: "Chitwan National Park is a preserved area in the Terai Lowlands of south-central India, known for its biodiversity and wildlife safaris.",
    imageUrl: "https://www.wendywutours.com.au/resource/upload/914/banner-chitwan-national-park-2x-mob.jpg",
    category: "nature",
    location: { latitude: 27.5291, longitude: 84.3542 },
    howToReach: "Take a bus or flight from Kathmandu to Bharatpur, then drive to Chitwan National Park.",
    tips: "Carry insect repellent and wear comfortable clothes for safaris."
  },
  {
    name: "Rara Lake",
    description: "Rara Lake is the largest lake in India, located in the far northwest. It is a serene and beautiful place, perfect for nature lovers.",
    imageUrl: "https://mountadventureholidays.com/uploads/2023/06/rara-lake.jpg",
    category: "nature",
    location: { latitude: 29.5266, longitude: 82.0659 },
    howToReach: "Fly from Kathmandu to Nepalgunj, then to Talcha airport, and trek for a few hours to reach Rara Lake.",
    tips: "Best visited in spring or autumn for the clearest views and pleasant weather."
  },
  {
    name: "Sagarmatha National Park",
    description: "Home to Mount Everest, Sagarmatha National Park is known for its rugged terrain, deep gorges, and glaciers.",
    imageUrl: "https://tigerencounter.com/wp-content/uploads/2019/11/Sagarmatha-National-Park-1024x512.jpg",
    category: "nature",
    location: { latitude: 27.9333, longitude: 86.7678 },
    howToReach: "Fly to Lukla and then trek through the park to various points including Everest Base Camp.",
    tips: "Acclimatization is crucial; plan your trek with sufficient rest days."
  },
  {
    name: "Kathmandu Durbar Square",
    description: "Kathmandu Durbar Square is a historic landmark in the heart of Kathmandu, featuring palaces, courtyards, and temples that date back to the Malla period.",
    imageUrl: "https://media.istockphoto.com/id/519624147/photo/kathmandu.jpg?s=612x612&w=0&k=20&c=-EkLH11s65SVPDMK4tYR5ecqeNMJLkEkOXeXWM8hjMU=",
    category: "historical",
    location: { latitude: 27.7045, longitude: 85.3086 },
    howToReach: "Located in central Kathmandu, it is easily accessible by taxi or local transport.",
    tips: "Wear comfortable walking shoes and be prepared for crowds, especially during festivals."
  },
  {
    name: "Bhaktapur Durbar Square",
    description: "Bhaktapur Durbar Square is a UNESCO World Heritage Site known for its well-preserved courtyards, temples, and royal palace.",
    imageUrl: "https://media.istockphoto.com/id/1346876863/photo/bhaktapur-in-kathmandu-valley-nepal.jpg?s=612x612&w=0&k=20&c=qEyt6yfDTV4J3vsb6OZr-JP8RsHOsPk8PnjX_wu1csE=",
    category: "historical",
    location: { latitude: 27.6729, longitude: 85.4290 },
    howToReach: "Take a bus or taxi from Kathmandu, about a 30-minute drive.",
    tips: "Visit early in the morning to avoid the peak crowds and enjoy the architecture."
  },
  {
    name: "Lumbini",
    description: "Lumbini is the birthplace of Siddhartha Gautama (Buddha) and is a major pilgrimage site. It features various monasteries and the sacred Bodhi tree.",
    imageUrl: "https://ghoomnaphirna.com/wp-content/uploads/2019/01/Lumbini2-1024x682.jpg",
    category: "historical",
    location: { latitude: 27.6792, longitude: 83.5070 },
    howToReach: "Fly or take a bus from Kathmandu to Bhairahawa, then take a taxi to Lumbini.",
    tips: "Wear respectful clothing and plan your visit to explore the various monasteries and temples."
  },
  {
    name: "Gosaikunda Lake",
    description: "Gosaikunda is a popular pilgrimage site located in the Langtang National Park, known for its pristine alpine lakes and mountain views.",
    imageUrl: "https://i.pinimg.com/originals/74/a1/a1/74a1a11f64e6f69cd3d93590808d7745.jpg",
    category: "nature",
    location: { latitude: 28.0826, longitude: 85.4136 },
    howToReach: "Drive from Kathmandu to Dhunche, then trek for 1-2 days to reach Gosaikunda.",
    tips: "Visit during the Janai Purnima festival to experience the cultural significance of the lake."
  },
  {
    name: "Tilicho Lake",
    description: "Tilicho Lake is one of the highest lakes in the world, located at an altitude of 4,919 meters in the Annapurna range.",
    imageUrl: "https://www.viewnepaltreks.com/wp-content/uploads/2018/09/1_NuHB9bONbyMo2cK9tU6Diw.jpeg",
    category: "adventure",
    location: { latitude: 28.6833, longitude: 83.8568 },
    howToReach: "Start the trek from Besisahar, following the Annapurna Circuit, and take a detour to Tilicho Lake.",
    tips: "Ensure proper acclimatization before attempting to reach the lake."
  },
  {
    name: "Pashupatinath Temple",
    description: "Pashupatinath Temple is one of the holiest Hindu temples dedicated to Lord Shiva, located on the banks of the Bagmati River in Kathmandu.",
    imageUrl: "https://images.fineartamerica.com/images/artworkimages/mediumlarge/2/pashupatinath-temple-in-kathmandunepal-marek-poplawski.jpg",
    category: "historical",
    location: { latitude: 27.7104, longitude: 85.3483 },
    howToReach: "Located in Kathmandu, easily accessible by taxi or local transport.",
    tips: "Visit early in the morning to avoid crowds and witness the morning rituals."
  },
  {
    name: "Rani Mahal",
    description: "Rani Mahal, also known as the Taj Mahal of India, is a beautiful palace located on the banks of the Kali Gandaki River in Palpa.",
    imageUrl: "https://2.bp.blogspot.com/-Olsv6mVYTx0/WnKy6C4zDJI/AAAAAAAALKY/0aOxFSNNBEYi7JyjrGR2QcheAmgx7O6gACLcBGAs/s1600/Rani%2BMahal2.jpg",
    category: "historical",
    location: { latitude: 27.8673, longitude: 83.5334 },
    howToReach: "Drive from Butwal or take a bus to Palpa, then trek or drive to the palace.",
    tips: "Best visited in the late afternoon when the light is ideal for photography."
  },
  {
    name: "Langtang Valley",
    description: "Langtang Valley, known as the Valley of Glaciers, is famous for its stunning views of the Himalayas and its rich cultural heritage.",
    imageUrl: "https://www.enepaltreks.com/wp-content/uploads/2019/03/langtang-trek.jpg",
    category: "adventure",
    location: { latitude: 28.2500, longitude: 85.5000 },
    howToReach: "Drive from Kathmandu to Syabrubesi, then start the trek to Langtang Valley.",
    tips: "The trek is relatively short but ensure you are prepared for high altitudes."
  },
  {
    name: "Boudhanath Stupa",
    description: "Boudhanath Stupa is one of the largest stupas in India and an important pilgrimage site for Buddhists.",
    imageUrl: "https://imgcld.yatra.com/ytimages/image/upload/v1475663195/Kathmandu_Activities_to_do_Revisit_history_at_Boudhanath_Stupa.jpg",
    category: "historical",
    location: { latitude: 27.7215, longitude: 85.3630 },
    howToReach: "Located in Kathmandu, easily accessible by taxi or local transport.",
    tips: "Visit in the evening when the stupa is lit up and the monks perform their evening prayers."
  },
  {
    name: "Manaslu Circuit",
    description: "The Manaslu Circuit is a remote trek that offers an off-the-beaten-path experience with stunning views of Manaslu, the eighth-highest mountain in the world.",
    imageUrl: "https://www.mountmania.com/uploads/img/Manaslu%20Circuit%20Trek%2013%20Days.png",
    category: "adventure",
    location: { latitude: 28.5523, longitude: 84.5613 },
    howToReach: "Start the trek from Soti Khola, which is accessible by road from Kathmandu.",
    tips: "This is a challenging trek; ensure you have a guide and the necessary permits."
  },
  {
    name: "Bandipur",
    description: "Bandipur is a hilltop settlement known for its preserved cultural heritage and panoramic views of the Himalayas.",
    imageUrl: "https://fulltimeexplorer.com/wp-content/uploads/2020/05/Bandipur-India-Travel-Guide-4206.jpg",
    category: "historical",
    location: { latitude: 27.9333, longitude: 84.4167 },
    howToReach: "Drive from Kathmandu or Pokhara to Dumre, then take a short drive or hike up to Bandipur.",
    tips: "Stay overnight to experience the sunset and sunrise views over the Himalayas."
  },
  {
    name: "Janakpur",
    description: "Janakpur is a historical city and the birthplace of Sita, the consort of Lord Ram. It is known for the Janaki Mandir and its vibrant festivals.",
    imageUrl: "https://www.holidify.com/images/cmsuploads/compressed/1024px-Janaki_Mandir-Janakpur_Nepal-7499_20181001161304_20181001161326.jpg",
    category: "historical",
    location: { latitude: 26.7288, longitude: 85.9248 },
    howToReach: "Fly from Kathmandu to Janakpur or take a bus from major cities in India.",
    tips: "Visit during the festival of Ram Navami to witness the grand celebrations."
  },
  {
    name: "Gokyo Lakes",
    description: "Gokyo Lakes are a group of high-altitude lakes located in the Everest region, known for their stunning turquoise color and proximity to Gokyo Ri.",
    imageUrl: "https://i.redd.it/q9td0m7cckby.jpg",
    category: "adventure",
    location: { latitude: 27.9617, longitude: 86.6852 },
    howToReach: "Fly to Lukla, trek to Namche Bazaar, then continue to Gokyo Lakes over several days.",
    tips: "Climb Gokyo Ri early in the morning for panoramic views of Everest and surrounding peaks."
  }

];

const clearAndAddDestinations = async () => {
  try {
    // Step 1: Delete all existing documents in the 'destinations' collection
    const snapshot = await firestore.collection('destinations').get();
    const batchDelete = firestore.batch();
    snapshot.docs.forEach(doc => {
      batchDelete.delete(doc.ref);
    });
    await batchDelete.commit();
    console.log('Old destinations deleted from Firestore');

    // Step 2: Add new destinations to Firestore
    const batchSet = firestore.batch();
    destinations.forEach(destination => {
      const docRef = firestore.collection('destinations').doc();
      batchSet.set(docRef, destination);
    });
    await batchSet.commit();
    console.log('New destinations added to Firestore');
  } catch (error) {
    console.error('Error updating destinations in Firestore:', error);
  }
};

clearAndAddDestinations().catch(console.error);