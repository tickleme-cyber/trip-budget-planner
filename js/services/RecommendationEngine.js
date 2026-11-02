/**
 * RecommendationEngine.js — Destination Recommendation Service
 * Demonstrates:
 *  - Encapsulation (Private destination catalog and scoring algorithms)
 *  - Strategy Pattern (Incorporates TravelStrategy polymorphic models)
 *  - Factory Pattern (Utilizes ExpenseFactory to generate starter expenses)
 *  - Composition (Generates structured Trip and Expense domain models)
 */
import { Destination } from '../models/Destination.js';
import { TravelStrategyFactory } from '../models/TravelStrategy.js';
import { Trip } from '../models/Trip.js';
import { Traveler } from '../models/Traveler.js';
import { ExpenseFactory } from '../models/ExpenseSubclasses.js';

export class RecommendationEngine {
    #destinations = [];

    constructor() {
        this.#initCatalog();
    }

    /**
     * Initializes a rich, diverse destination database.
     */
    #initCatalog() {
        const rawCatalog = [
            // ── DOMESTIC / INDIA GEMS (Low to Mid Budget) ─────────────────────────
            {
                id: 'dest_goa',
                name: 'Goa',
                country: 'India',
                region: 'Domestic / India',
                tagline: 'Sun, sand, coastal spice, and Portuguese colonial charm',
                description: 'Relax on golden beaches, explore 17th-century Latin quarters, enjoy lively beach shacks and vibrant night markets.',
                vibes: ['Beach', 'Nightlife', 'Foodie', 'Culture'],
                baseFlightCost: 80,
                dailyStayCost: 45,
                dailyFoodCost: 20,
                dailyActivityCost: 15,
                idealDaysMin: 3,
                idealDaysMax: 6,
                bestSeason: 'Nov – Mar',
                highlights: ['Anjuna & Palolem Beaches', 'Fontainhas Latin Quarter', 'Dudhsagar Waterfalls'],
                rating: 4.8,
                imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
                tier: 'Budget'
            },
            {
                id: 'dest_manali',
                name: 'Manali & Solang Valley',
                country: 'India',
                region: 'Domestic / India',
                tagline: 'Snow-capped Himalayan peaks, pine forests, and alpine adventure',
                description: 'Breathtaking mountain passes, paragliding over Solang, serene apple orchards, and cozy river-side cafes.',
                vibes: ['Mountain', 'Adventure', 'Nature', 'Relaxation'],
                baseFlightCost: 90,
                dailyStayCost: 40,
                dailyFoodCost: 18,
                dailyActivityCost: 25,
                idealDaysMin: 4,
                idealDaysMax: 7,
                bestSeason: 'Oct – Jun',
                highlights: ['Atal Tunnel & Rohtang Pass', 'Solang Valley Paragliding', 'Old Manali Cafes'],
                rating: 4.7,
                imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
                tier: 'Budget'
            },
            {
                id: 'dest_jaipur',
                name: 'Jaipur & Udaipur',
                country: 'India',
                region: 'Domestic / India',
                tagline: 'The Pink City and Lake City royal heritage odyssey',
                description: 'Magnificent amber sandstone forts, gleaming lake palaces, vibrant textiles, and rich Rajasthani royal culinary feasts.',
                vibes: ['Heritage', 'Culture', 'Foodie'],
                baseFlightCost: 75,
                dailyStayCost: 50,
                dailyFoodCost: 22,
                dailyActivityCost: 18,
                idealDaysMin: 4,
                idealDaysMax: 7,
                bestSeason: 'Oct – Mar',
                highlights: ['Amber Fort & Hawa Mahal', 'Lake Pichola Boat Cruise', 'City Palace Udaipur'],
                rating: 4.9,
                imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
                tier: 'Budget'
            },
            {
                id: 'dest_kerala',
                name: 'Kerala (Munnar & Alleppey)',
                country: 'India',
                region: 'Domestic / India',
                tagline: 'God\'s Own Country: emerald tea hills & tranquil backwaters',
                description: 'Cruise emerald backwaters in a traditional houseboat, breathe mist over manicured tea estates, and savor authentic Ayurvedic hospitality.',
                vibes: ['Nature', 'Relaxation', 'Wellness', 'Culture'],
                baseFlightCost: 85,
                dailyStayCost: 55,
                dailyFoodCost: 20,
                dailyActivityCost: 15,
                idealDaysMin: 4,
                idealDaysMax: 8,
                bestSeason: 'Sep – Mar',
                highlights: ['Alleppey Houseboat Stay', 'Munnar Tea Plantations', 'Kathakali Dance & Ayurveda'],
                rating: 4.9,
                imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80',
                tier: 'Budget'
            },
            {
                id: 'dest_rishikesh',
                name: 'Rishikesh & Haridwar',
                country: 'India',
                region: 'Domestic / India',
                tagline: 'White water rapids, yoga sanctuaries, and evening Ganga Aarti',
                description: 'Raft the thrilling rapids of the Ganges, practice yoga by sacred riverbanks, and hear chiming temple bells at sunset.',
                vibes: ['Adventure', 'Wellness', 'Mountain', 'Culture'],
                baseFlightCost: 65,
                dailyStayCost: 35,
                dailyFoodCost: 16,
                dailyActivityCost: 22,
                idealDaysMin: 3,
                idealDaysMax: 5,
                bestSeason: 'Sep – May',
                highlights: ['Ganges River Rafting Grade III/IV', 'Triveni Ghat Evening Aarti', 'Beatles Ashram'],
                rating: 4.7,
                imageUrl: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=800&auto=format&fit=crop&q=80',
                tier: 'Budget'
            },
            {
                id: 'dest_pondicherry',
                name: 'Pondicherry',
                country: 'India',
                region: 'Domestic / India',
                tagline: 'French colonial boulevards, pastel villas, and serene promenades',
                description: 'Stroll cobblestone French Quarters with bright bougainvillea, sip espresso in chic bakeries, and discover Auroville\'s peaceful vibe.',
                vibes: ['Beach', 'Culture', 'Relaxation', 'Foodie'],
                baseFlightCost: 70,
                dailyStayCost: 40,
                dailyFoodCost: 20,
                dailyActivityCost: 12,
                idealDaysMin: 2,
                idealDaysMax: 4,
                bestSeason: 'Oct – Mar',
                highlights: ['White Town French Quarter', 'Rock Beach Promenade', 'Auroville Matrimandir'],
                rating: 4.6,
                imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80',
                tier: 'Budget'
            },
            {
                id: 'dest_ladakh',
                name: 'Ladakh & Leh',
                country: 'India',
                region: 'Domestic / India',
                tagline: 'Land of High Mountain Passes, azure lakes, and ancient gompas',
                description: 'Cross the world’s highest motorable passes, marvel at the shifting blues of Pangong Tso, and experience Tibetan Buddhist culture.',
                vibes: ['Mountain', 'Adventure', 'Nature'],
                baseFlightCost: 160,
                dailyStayCost: 55,
                dailyFoodCost: 24,
                dailyActivityCost: 30,
                idealDaysMin: 6,
                idealDaysMax: 10,
                bestSeason: 'May – Sep',
                highlights: ['Pangong Tso & Nubra Valley', 'Khardung La Pass', 'Thiksey & Hemis Monasteries'],
                rating: 4.9,
                imageUrl: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&auto=format&fit=crop&q=80',
                tier: 'Moderate'
            },

            // ── SOUTHEAST ASIA & BUDGET INTERNATIONAL ($600 – $1,500) ──────────────
            {
                id: 'dest_bali',
                name: 'Bali & Nusa Penida',
                country: 'Indonesia',
                region: 'Southeast Asia',
                tagline: 'Island of the Gods: emerald rice terraces, surf breaks & sunset temples',
                description: 'Tropical paradise blending lush jungle swings, cliffside Hindu temples, turquoise surf breaks, and vibrant beach clubs.',
                vibes: ['Beach', 'Wellness', 'Culture', 'Nightlife', 'Adventure'],
                baseFlightCost: 320,
                dailyStayCost: 65,
                dailyFoodCost: 25,
                dailyActivityCost: 25,
                idealDaysMin: 5,
                idealDaysMax: 9,
                bestSeason: 'Apr – Oct',
                highlights: ['Ubud Monkey Forest & Rice Terraces', 'Nusa Penida Kelingking Beach', 'Uluwatu Sunset Temple & Kecak Dance'],
                rating: 4.9,
                imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
                tier: 'Moderate'
            },
            {
                id: 'dest_phuket',
                name: 'Phuket & Krabi',
                country: 'Thailand',
                region: 'Southeast Asia',
                tagline: 'Limestone karsts rising from turquoise Andaman waters',
                description: 'Island hop via longtail boat through Maya Bay, kayak towering limestone sea caves, and enjoy spicy street pad thai.',
                vibes: ['Beach', 'Nightlife', 'Adventure', 'Foodie'],
                baseFlightCost: 280,
                dailyStayCost: 60,
                dailyFoodCost: 22,
                dailyActivityCost: 30,
                idealDaysMin: 5,
                idealDaysMax: 8,
                bestSeason: 'Nov – Apr',
                highlights: ['Phi Phi Islands & Maya Bay', 'Railay Beach Rock Climbing', 'Old Phuket Town Night Market'],
                rating: 4.8,
                imageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&auto=format&fit=crop&q=80',
                tier: 'Moderate'
            },
            {
                id: 'dest_vietnam',
                name: 'Hanoi & Ha Long Bay',
                country: 'Vietnam',
                region: 'Southeast Asia',
                tagline: 'UNESCO limestone karst wonderland & legendary street cuisine',
                description: 'Cruise emerald waters amongst thousands of limestone peaks, sip egg coffee in historic alleys, and savor steaming bowls of pho.',
                vibes: ['Culture', 'Nature', 'Foodie', 'Adventure'],
                baseFlightCost: 260,
                dailyStayCost: 45,
                dailyFoodCost: 18,
                dailyActivityCost: 25,
                idealDaysMin: 5,
                idealDaysMax: 8,
                bestSeason: 'Oct – Apr',
                highlights: ['Overnight Ha Long Bay Cruise', 'Hanoi Old Quarter & Beer Street', 'Trang An River Caves Ninh Binh'],
                rating: 4.8,
                imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80',
                tier: 'Budget'
            },
            {
                id: 'dest_danang',
                name: 'Da Nang & Hoi An',
                country: 'Vietnam',
                region: 'Southeast Asia',
                tagline: 'Yellow lantern town, ancient canals, and the Golden Hand Bridge',
                description: 'Step into a lantern-lit fairytale in ancient Hoi An, walk high above the clouds on the Golden Hand Bridge, and enjoy coastal sands.',
                vibes: ['Culture', 'Beach', 'Foodie', 'Relaxation'],
                baseFlightCost: 270,
                dailyStayCost: 48,
                dailyFoodCost: 19,
                dailyActivityCost: 22,
                idealDaysMin: 4,
                idealDaysMax: 7,
                bestSeason: 'Feb – Aug',
                highlights: ['Hoi An Ancient Lantern Town', 'Ba Na Hills Golden Bridge', 'My Khe Beach'],
                rating: 4.9,
                imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80',
                tier: 'Budget'
            },
            {
                id: 'dest_bangkok',
                name: 'Bangkok & Chiang Mai',
                country: 'Thailand',
                region: 'Southeast Asia',
                tagline: 'Golden Buddhist temples, bustling river ferries, and northern mountain mist',
                description: 'Marvel at Wat Arun and the Grand Palace, bargain in Chatuchak Market, then travel north to Chiang Mai for elephant sanctuaries.',
                vibes: ['City', 'Culture', 'Foodie', 'Nightlife'],
                baseFlightCost: 250,
                dailyStayCost: 50,
                dailyFoodCost: 20,
                dailyActivityCost: 25,
                idealDaysMin: 5,
                idealDaysMax: 9,
                bestSeason: 'Nov – Feb',
                highlights: ['Wat Pho & Grand Palace', 'Chiang Mai Ethical Elephant Sanctuary', 'Chao Phraya River Cruise'],
                rating: 4.8,
                imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=80',
                tier: 'Moderate'
            },
            {
                id: 'dest_srilanka',
                name: 'Sri Lanka (Colombo, Kandy & Ella)',
                country: 'Sri Lanka',
                region: 'Southeast Asia',
                tagline: 'The iconic blue train ride through tea hills & coastal surf',
                description: 'Ride the world\'s most scenic blue train from Kandy to Ella, spot wild leopards in Yala, and surf clean peelers at Mirissa.',
                vibes: ['Nature', 'Adventure', 'Beach', 'Culture'],
                baseFlightCost: 210,
                dailyStayCost: 45,
                dailyFoodCost: 18,
                dailyActivityCost: 22,
                idealDaysMin: 6,
                idealDaysMax: 9,
                bestSeason: 'Dec – Apr',
                highlights: ['Kandy to Ella Blue Train Ride', 'Nine Arches Bridge', 'Sigiriya Lion Rock Fortress'],
                rating: 4.8,
                imageUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&auto=format&fit=crop&q=80',
                tier: 'Budget'
            },
            {
                id: 'dest_singapore',
                name: 'Singapore',
                country: 'Singapore',
                region: 'Southeast Asia',
                tagline: 'Futuristic Garden City: Supertrees, rooftop infinity pools & hawker cuisine',
                description: 'Walk inside botanical glass biomes, watch nightly laser shows over Marina Bay, and taste Michelin-starred chicken rice for $4.',
                vibes: ['City', 'Foodie', 'Culture', 'Nightlife'],
                baseFlightCost: 260,
                dailyStayCost: 110,
                dailyFoodCost: 35,
                dailyActivityCost: 35,
                idealDaysMin: 3,
                idealDaysMax: 5,
                bestSeason: 'Year-round',
                highlights: ['Gardens by the Bay & Supertree Grove', 'Marina Bay Sands SkyPark', 'Chinatown & Maxwell Hawker Centres'],
                rating: 4.8,
                imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=80',
                tier: 'Moderate'
            },
            {
                id: 'dest_nepal',
                name: 'Kathmandu & Pokhara',
                country: 'Nepal',
                region: 'Southeast Asia',
                tagline: 'Gateway to the Annapurnas, sacred stupas, and alpine lakes',
                description: 'View the 8,000-meter peaks of the Annapurna massif reflected in Phewa Lake, spin prayer wheels at Boudhanath, and paraglide with eagles.',
                vibes: ['Mountain', 'Adventure', 'Culture', 'Wellness'],
                baseFlightCost: 190,
                dailyStayCost: 35,
                dailyFoodCost: 16,
                dailyActivityCost: 20,
                idealDaysMin: 5,
                idealDaysMax: 9,
                bestSeason: 'Sep – Nov',
                highlights: ['Phewa Lake & Sarangkot Sunrise', 'Boudhanath & Swayambhunath Stupas', 'Pokhara Paragliding'],
                rating: 4.7,
                imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
                tier: 'Budget'
            },

            // ── MID-TIER & MODERN INTERNATIONAL ($1,200 – $2,800) ───────────────────
            {
                id: 'dest_dubai',
                name: 'Dubai & Abu Dhabi',
                country: 'United Arab Emirates',
                region: 'Middle East & Africa',
                tagline: 'Futuristic desert metropolis of sky-high architecture and golden dunes',
                description: 'Ascend the world\'s tallest skyscraper, dune bash in 4x4 safaris, explore the Louvre Abu Dhabi, and stroll glittering souks.',
                vibes: ['City', 'Adventure', 'Nightlife', 'Culture'],
                baseFlightCost: 290,
                dailyStayCost: 110,
                dailyFoodCost: 45,
                dailyActivityCost: 50,
                idealDaysMin: 4,
                idealDaysMax: 7,
                bestSeason: 'Nov – Mar',
                highlights: ['Burj Khalifa Level 148', 'Red Dunes Desert Safari & BBQ', 'Sheikh Zayed Grand Mosque'],
                rating: 4.8,
                imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
                tier: 'Moderate'
            },
            {
                id: 'dest_turkey',
                name: 'Istanbul & Cappadocia',
                country: 'Turkey',
                region: 'Europe',
                tagline: 'Where continents collide: fairy chimneys, hot air balloons & spice bazaars',
                description: 'Float over fairy chimneys in a hot air balloon at sunrise, cruise the Bosphorus dividing Europe & Asia, and marvel at Hagia Sophia.',
                vibes: ['Heritage', 'Culture', 'Adventure', 'Foodie'],
                baseFlightCost: 420,
                dailyStayCost: 75,
                dailyFoodCost: 28,
                dailyActivityCost: 45,
                idealDaysMin: 6,
                idealDaysMax: 9,
                bestSeason: 'Apr – Jun, Sep – Nov',
                highlights: ['Cappadocia Sunrise Hot Air Balloon Flight', 'Hagia Sophia & Blue Mosque', 'Bosphorus Sunset Yacht Cruise'],
                rating: 4.9,
                imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop&q=80',
                tier: 'Moderate'
            },
            {
                id: 'dest_prague',
                name: 'Prague & Budapest',
                country: 'Czech Republic & Hungary',
                region: 'Europe',
                tagline: 'City of a Hundred Spires, historic castles, and thermal bathhouses',
                description: 'Cross the gothic Charles Bridge, soak in ancient Roman-style thermal baths on the Danube, and explore fairytale cobblestone alleys.',
                vibes: ['Heritage', 'Culture', 'Nightlife', 'Foodie'],
                baseFlightCost: 550,
                dailyStayCost: 75,
                dailyFoodCost: 32,
                dailyActivityCost: 25,
                idealDaysMin: 6,
                idealDaysMax: 10,
                bestSeason: 'May – Sep',
                highlights: ['Prague Old Town Square & Astronomical Clock', 'Széchenyi Thermal Baths Budapest', 'Danube River Night Cruise'],
                rating: 4.8,
                imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&auto=format&fit=crop&q=80',
                tier: 'Moderate'
            },
            {
                id: 'dest_greece',
                name: 'Athens & Santorini',
                country: 'Greece',
                region: 'Europe',
                tagline: 'Ancient cradle of democracy and iconic whitewashed Aegean cliff towns',
                description: 'Walk beneath the Parthenon on the Acropolis, sail the volcanic caldera of Santorini, and catch world-famous sunsets in Oia.',
                vibes: ['Heritage', 'Beach', 'Culture', 'Foodie'],
                baseFlightCost: 580,
                dailyStayCost: 110,
                dailyFoodCost: 40,
                dailyActivityCost: 35,
                idealDaysMin: 6,
                idealDaysMax: 9,
                bestSeason: 'May – Oct',
                highlights: ['Acropolis & Parthenon', 'Oia Village Blue Dome Sunset', 'Caldera Catamaran Sailing Cruise'],
                rating: 4.9,
                imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop&q=80',
                tier: 'Moderate'
            },

            // ── LUXURY & ICONIC DREAM DESTINATIONS ($2,500 – $5,000+) ───────────────
            {
                id: 'dest_japan',
                name: 'Tokyo & Kyoto',
                country: 'Japan',
                region: 'East Asia',
                tagline: 'Neon cyber-metropolis meets serene zen gardens and ancient shrines',
                description: 'Cross the world’s busiest pedestrian crossing in Shibuya, ride the 320 km/h Shinkansen bullet train, and walk through thousands of vermilion torii gates.',
                vibes: ['City', 'Culture', 'Foodie', 'Heritage'],
                baseFlightCost: 650,
                dailyStayCost: 120,
                dailyFoodCost: 45,
                dailyActivityCost: 40,
                idealDaysMin: 7,
                idealDaysMax: 12,
                bestSeason: 'Mar – May, Oct – Nov',
                highlights: ['Fushimi Inari Shrine & Arashiyama Bamboo Grove', 'Shibuya & Shinjuku Tokyo Nightlife', 'Mt. Fuji Day Tour & Bullet Train'],
                rating: 4.95,
                imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
                tier: 'Luxury'
            },
            {
                id: 'dest_swiss',
                name: 'Swiss Alps (Interlaken & Zermatt)',
                country: 'Switzerland',
                region: 'Europe',
                tagline: 'Top of Europe: jagged glacier peaks, alpine lakes & cogwheel trains',
                description: 'Ride historic cogwheel railways to the Jungfraujoch glacier, gaze at the legendary Matterhorn in Zermatt, and cruise pristine turquoise lakes.',
                vibes: ['Mountain', 'Nature', 'Adventure', 'Relaxation'],
                baseFlightCost: 720,
                dailyStayCost: 160,
                dailyFoodCost: 60,
                dailyActivityCost: 65,
                idealDaysMin: 6,
                idealDaysMax: 10,
                bestSeason: 'Jun – Sep (Hiking) / Dec – Mar (Ski)',
                highlights: ['Jungfraujoch Top of Europe', 'Matterhorn Viewpoint Zermatt', 'Lake Brienz & Lauterbrunnen Waterfalls'],
                rating: 4.96,
                imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80',
                tier: 'Luxury'
            },
            {
                id: 'dest_paris',
                name: 'Paris & Côte d’Azur',
                country: 'France',
                region: 'Europe',
                tagline: 'The City of Light and glamorous French Riviera coastlines',
                description: 'Admire the sparkling Eiffel Tower, view the Mona Lisa in the Louvre, stroll Mediterranean promenades in Nice, and savor warm croissants.',
                vibes: ['Culture', 'Heritage', 'Foodie', 'Beach'],
                baseFlightCost: 680,
                dailyStayCost: 140,
                dailyFoodCost: 55,
                dailyActivityCost: 45,
                idealDaysMin: 6,
                idealDaysMax: 10,
                bestSeason: 'Apr – Oct',
                highlights: ['Eiffel Tower & Seine River Cruise', 'The Louvre Museum', 'Nice Promenade des Anglais'],
                rating: 4.85,
                imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
                tier: 'Luxury'
            },
            {
                id: 'dest_italy',
                name: 'Rome & Amalfi Coast',
                country: 'Italy',
                region: 'Europe',
                tagline: 'Gladiator history, Positano pastel cliffs, and handmade pasta',
                description: 'Stand in awe inside the Colosseum, marvel at Michelangelo’s Sistine Chapel, then escape south to the dramatic coastal cliffs of Amalfi.',
                vibes: ['Heritage', 'Beach', 'Foodie', 'Culture'],
                baseFlightCost: 690,
                dailyStayCost: 135,
                dailyFoodCost: 50,
                dailyActivityCost: 45,
                idealDaysMin: 7,
                idealDaysMax: 11,
                bestSeason: 'Apr – Jun, Sep – Oct',
                highlights: ['Colosseum & Roman Forum', 'Vatican Museums & St. Peter’s', 'Positano & Capri Boat Tour'],
                rating: 4.92,
                imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
                tier: 'Luxury'
            },
            {
                id: 'dest_maldives',
                name: 'Maldives Overwater Resort',
                country: 'Maldives',
                region: 'Middle East & Africa',
                tagline: 'Pure island seclusion, overwater villas & vibrant coral reefs',
                description: 'Wake up above crystal-clear turquoise lagoons, step directly into coral gardens with manta rays, and enjoy sunset dolphin cruises.',
                vibes: ['Beach', 'Relaxation', 'Wellness', 'Adventure'],
                baseFlightCost: 450,
                dailyStayCost: 260,
                dailyFoodCost: 75,
                dailyActivityCost: 55,
                idealDaysMin: 4,
                idealDaysMax: 7,
                bestSeason: 'Nov – Apr',
                highlights: ['Overwater Bungalow Experience', 'Snorkeling with Manta Rays & Sea Turtles', 'Sunset Dolphin Speedboat Cruise'],
                rating: 4.95,
                imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop&q=80',
                tier: 'Luxury'
            },
            {
                id: 'dest_spain',
                name: 'Barcelona & Costa Brava',
                country: 'Spain',
                region: 'Europe',
                tagline: 'Gaudí’s architectural marvels, lively tapas bars, and Mediterranean beaches',
                description: 'Gaze up at the surreal spires of Sagrada Familia, eat tapas in bustling Gothic Quarter alleys, and sunbathe along the Mediterranean sea.',
                vibes: ['Culture', 'Beach', 'Foodie', 'Nightlife', 'City'],
                baseFlightCost: 620,
                dailyStayCost: 105,
                dailyFoodCost: 42,
                dailyActivityCost: 35,
                idealDaysMin: 5,
                idealDaysMax: 8,
                bestSeason: 'May – Oct',
                highlights: ['Sagrada Família & Park Güell', 'Gothic Quarter Tapas Crawl', 'Barceloneta Beach Promenade'],
                rating: 4.88,
                imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80',
                tier: 'Moderate'
            }
        ];

        this.#destinations = rawCatalog.map(item => new Destination(item));
    }

    /**
     * All destinations in catalog
     * @returns {Destination[]}
     */
    get destinations() {
        return [...this.#destinations];
    }

    /**
     * Finds a single destination by its ID.
     * @param {string} id 
     * @returns {Destination|null}
     */
    findDestinationById(id) {
        return this.#destinations.find(d => d.id === id) || null;
    }

    /**
     * Main Recommendation Engine Algorithm:
     * Evaluates budget, duration, party size, travel strategy, vibes and regions.
     * Computes multi-factor match score and returns ranked recommendations.
     * 
     * @param {Object} options
     * @param {number} options.budget - User target budget (in USD or normalized)
     * @param {number} [options.travelers=1] - Number of travelers
     * @param {number} [options.days=5] - Trip duration in days
     * @param {string} [options.travelStyle='moderate'] - 'backpacker' | 'moderate' | 'luxury'
     * @param {string} [options.vibe='all'] - Preferred vibe filter
     * @param {string} [options.region='all'] - Preferred region filter
     * @param {string} [options.fitFilter='all'] - 'all' | 'within' | 'saver' | 'stretch'
     * @param {number} [options.fxRate=1] - Multiplier from USD to target display currency
     * @param {string} [options.currencySymbol='$'] - Display currency symbol
     * @returns {Array<Object>} Sorted list of recommendation results
     */
    getRecommendations({
        budget,
        travelers = 1,
        days = 5,
        travelStyle = 'moderate',
        vibe = 'all',
        region = 'all',
        fitFilter = 'all',
        fxRate = 1,
        currencySymbol = '$'
    }) {
        const userBudgetUSD = Math.max(10, Number(budget) / (fxRate || 1));
        const numTravelers = Math.max(1, parseInt(travelers, 10) || 1);
        const numDays = Math.max(1, parseInt(days, 10) || 1);

        const strategy = TravelStrategyFactory.getStrategy(travelStyle);

        // Filter by region and vibe
        const candidates = this.#destinations.filter(dest => {
            const matchesVibe = dest.hasVibe(vibe);
            const matchesReg = dest.matchesRegion(region);
            return matchesVibe && matchesReg;
        });

        const evaluated = candidates.map(dest => {
            const costUSD = dest.calculateEstimatedCost(numTravelers, numDays, strategy);
            const totalUSD = costUSD.total;
            const deltaUSD = userBudgetUSD - totalUSD; // positive = under budget, negative = stretch

            // Determine budget fit status
            let fitStatus = 'within_budget';
            let statusLabel = 'Perfect Fit';
            let statusClass = 'status-fit';

            if (totalUSD <= userBudgetUSD * 0.70) {
                fitStatus = 'budget_saver';
                statusLabel = '💰 Budget Saver';
                statusClass = 'status-saver';
            } else if (totalUSD <= userBudgetUSD) {
                fitStatus = 'within_budget';
                statusLabel = '✨ Within Budget';
                statusClass = 'status-fit';
            } else if (totalUSD <= userBudgetUSD * 1.15) {
                fitStatus = 'stretch';
                statusLabel = '⚡ Stretch Pick (+15%)';
                statusClass = 'status-stretch';
            } else {
                fitStatus = 'over_budget';
                statusLabel = '⚠️ Exceeds Budget';
                statusClass = 'status-over';
            }

            // Calculate comprehensive compatibility score (0 - 100)
            let score = 50;

            // Factor 1: Budget suitability (Max 45 pts)
            if (totalUSD <= userBudgetUSD) {
                // Optimal when using 70% to 100% of budget without going over
                const utilizationRatio = totalUSD / userBudgetUSD;
                score += 45 * Math.min(1, utilizationRatio >= 0.65 ? 1 : 0.75 + (utilizationRatio * 0.25));
            } else if (totalUSD <= userBudgetUSD * 1.15) {
                const overRatio = (totalUSD - userBudgetUSD) / (userBudgetUSD * 0.15);
                score += Math.max(10, 30 - (overRatio * 20)); // partial credit for stretch
            } else {
                score -= 30; // heavy penalty for being way over budget
            }

            // Factor 2: Duration suitability (Max 25 pts)
            if (numDays >= dest.idealDaysMin && numDays <= dest.idealDaysMax) {
                score += 25;
            } else {
                const diff = Math.min(
                    Math.abs(numDays - dest.idealDaysMin),
                    Math.abs(numDays - dest.idealDaysMax)
                );
                score += Math.max(5, 25 - (diff * 5));
            }

            // Factor 3: Vibe alignment (Max 15 pts)
            if (vibe && vibe.toLowerCase() !== 'all') {
                score += dest.hasVibe(vibe) ? 15 : 0;
            } else {
                score += 10;
            }

            // Factor 4: Rating bonus (Max 15 pts)
            score += Math.min(15, (dest.rating - 4.5) * 30);

            const matchPercentage = Math.max(25, Math.min(99, Math.round(score)));

            // Convert amounts to display currency
            const rate = fxRate || 1;
            const displayCosts = {
                flight: Math.round(costUSD.categories.flight * rate),
                hotel: Math.round(costUSD.categories.hotel * rate),
                food: Math.round(costUSD.categories.food * rate),
                activities: Math.round(costUSD.categories.activities * rate),
                contingency: Math.round(costUSD.categories.contingency * rate)
            };
            const displayTotal = Math.round(totalUSD * rate);
            const displayBudget = Math.round(userBudgetUSD * rate);
            const displayDelta = Math.round(deltaUSD * rate);
            const displayPerPerson = Math.round(costUSD.perPerson * rate);
            const displayDaily = Math.round(costUSD.perPersonPerDay * rate);

            return {
                destination: dest,
                costBreakdownUSD: costUSD,
                currencySymbol,
                displayCosts,
                displayTotal,
                displayBudget,
                displayDelta,
                displayPerPerson,
                displayDaily,
                fitStatus,
                statusLabel,
                statusClass,
                matchPercentage,
                strategyName: strategy.name,
                strategyIcon: strategy.icon
            };
        });

        // Apply fit filter if specified
        let filtered = evaluated;
        if (fitFilter === 'within') {
            filtered = evaluated.filter(r => r.fitStatus === 'within_budget' || r.fitStatus === 'budget_saver');
        } else if (fitFilter === 'saver') {
            filtered = evaluated.filter(r => r.fitStatus === 'budget_saver');
        } else if (fitFilter === 'stretch') {
            filtered = evaluated.filter(r => r.fitStatus === 'stretch');
        }

        // Sort: Best match percentage descending; then by closest to budget
        filtered.sort((a, b) => {
            if (b.matchPercentage !== a.matchPercentage) {
                return b.matchPercentage - a.matchPercentage;
            }
            return a.displayTotal - b.displayTotal;
        });

        return filtered;
    }

    /**
     * Converts a recommendation directly into a full Trip domain model
     * with pre-populated polymorphic Expense instances using the Factory pattern.
     * 
     * @param {Object} recommendation - Recommendation result from getRecommendations
     * @param {string} customTripName - User custom trip name (optional)
     * @param {Array<string>} travelerNames - Names of travelers
     * @param {boolean} includePreAllocatedExpenses - Whether to automatically generate starter expense objects
     * @returns {Trip} Created Trip instance
     */
    createTripFromRecommendation(
        recommendation,
        customTripName = '',
        travelerNames = ['You', 'Travel Companion'],
        includePreAllocatedExpenses = true
    ) {
        const dest = recommendation.destination;
        const tripName = customTripName.trim() || `${dest.name} Getaway`;
        const totalBudget = recommendation.displayBudget || recommendation.displayTotal;

        // Calculate trip dates: starts tomorrow, runs for recommended duration
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() + 1);
        const end = new Date(start);
        end.setDate(start.getDate() + recommendation.costBreakdownUSD.days);

        const startDateStr = start.toISOString().split('T')[0];
        const endDateStr = end.toISOString().split('T')[0];

        // 1. Create Traveler instances (Composition & Encapsulation)
        const travelers = travelerNames.map((name, idx) => {
            const cleanName = (name || `Traveler ${idx + 1}`).trim();
            return new Traveler(`trv_rec_${Date.now()}_${idx}`, cleanName);
        });

        if (travelers.length === 0) {
            travelers.push(new Traveler(`trv_rec_${Date.now()}_0`, 'Explorer'));
        }

        const primaryTravelerId = travelers[0].id;
        const allParticipantIds = travelers.map(t => t.id);

        // 2. Create Trip instance (Composition)
        const trip = new Trip({
            id: `trip_rec_${Date.now()}`,
            name: tripName,
            destination: `${dest.name}, ${dest.country}`,
            startDate: startDateStr,
            endDate: endDateStr,
            totalBudget: totalBudget,
            travelers: travelers,
            expenses: []
        });

        // 3. Polymorphically create starting expenses using ExpenseFactory
        if (includePreAllocatedExpenses) {
            const costs = recommendation.displayCosts;

            // Flight / Transit Expense
            if (costs.flight > 0) {
                const flightExpense = ExpenseFactory.createExpense({
                    category: 'Flight',
                    title: `Roundtrip Travel to ${dest.name}`,
                    baseAmount: Math.round(costs.flight * 0.85),
                    baggageFee: Math.round(costs.flight * 0.10),
                    airportTax: Math.round(costs.flight * 0.05),
                    date: startDateStr,
                    paidById: primaryTravelerId,
                    participantIds: allParticipantIds,
                    notes: `Estimated roundtrip flights/transit for ${travelers.length} traveler(s)`
                });
                trip.addExpense(flightExpense);
            }

            // Hotel Expense
            if (costs.hotel > 0) {
                const nights = recommendation.costBreakdownUSD.nights;
                const basePerNight = Math.round(costs.hotel / nights / 1.10);
                const hotelExpense = ExpenseFactory.createExpense({
                    category: 'Hotel',
                    title: `Accommodations in ${dest.name} (${nights} Nights)`,
                    baseAmount: basePerNight,
                    nights: nights,
                    serviceTaxPercent: 10,
                    date: startDateStr,
                    paidById: primaryTravelerId,
                    participantIds: allParticipantIds,
                    notes: `Estimated lodging (${recommendation.costBreakdownUSD.rooms} room(s))`
                });
                trip.addExpense(hotelExpense);
            }

            // Food & Dining Expense
            if (costs.food > 0) {
                const foodExpense = ExpenseFactory.createExpense({
                    category: 'Food',
                    title: `Food & Dining Budget in ${dest.name}`,
                    baseAmount: Math.round(costs.food * 0.85),
                    tipAmount: Math.round(costs.food * 0.10),
                    taxAmount: Math.round(costs.food * 0.05),
                    date: startDateStr,
                    paidById: primaryTravelerId,
                    participantIds: allParticipantIds,
                    notes: `Meals, local dining and cafe budget for ${recommendation.costBreakdownUSD.days} days`
                });
                trip.addExpense(foodExpense);
            }

            // Sightseeing & Activities Expense
            if (costs.activities > 0) {
                const actExpense = ExpenseFactory.createExpense({
                    category: 'Activities',
                    title: `Sightseeing & Excursions: ${dest.highlights.slice(0, 2).join(', ')}`,
                    baseAmount: Math.round(costs.activities * 0.90),
                    equipmentFee: Math.round(costs.activities * 0.10),
                    date: startDateStr,
                    paidById: primaryTravelerId,
                    participantIds: allParticipantIds,
                    notes: `Tickets, tours, and attraction passes`
                });
                trip.addExpense(actExpense);
            }
        }

        return trip;
    }
}

