import * as admin from "firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

// Initialize Firebase Admin
const serviceAccount = require("../serviceAccountKey.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()
const auth = admin.auth()

// Helper function to create a timestamp
const createTimestamp = (daysOffset = 0, hoursOffset = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  date.setHours(date.getHours() + hoursOffset)
  return Timestamp.fromDate(date)
}

// Helper function to generate random number within range
const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Helper function to pick a random item from an array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// South Indian cities
const southIndianCities = [
  'Chennai', 'Bengaluru', 'Hyderabad', 'Kochi', 'Coimbatore', 
  'Madurai', 'Mysuru', 'Visakhapatnam', 'Thiruvananthapuram', 'Mangaluru'
];

// South Indian localities by city
const localitiesByCity: Record<string, string[]> = {
  'Chennai': ['Anna Nagar', 'T. Nagar', 'Adyar', 'Velachery', 'Porur', 'Mylapore', 'Besant Nagar'],
  'Bengaluru': ['Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar', 'JP Nagar', 'HSR Layout', 'Electronic City'],
  'Hyderabad': ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Madhapur', 'HITEC City', 'Kukatpally', 'Secunderabad'],
  'Kochi': ['Fort Kochi', 'Edappally', 'Kakkanad', 'Palarivattom', 'Tripunithura', 'Marine Drive', 'Panampilly Nagar'],
  'Coimbatore': ['RS Puram', 'Peelamedu', 'Saibaba Colony', 'Ganapathy', 'Singanallur', 'Race Course', 'Vadavalli'],
  'Madurai': ['Anna Nagar', 'KK Nagar', 'Bypass Road', 'Mattuthavani', 'Villapuram', 'Arasaradi', 'Tirupparankundram'],
  'Mysuru': ['Vijayanagar', 'Kuvempunagar', 'Saraswathipuram', 'Gokulam', 'Hebbal', 'JP Nagar', 'Lakshmipuram'],
  'Visakhapatnam': ['MVP Colony', 'Dwaraka Nagar', 'Seethammadhara', 'Madhurawada', 'Rushikonda', 'Gajuwaka', 'Asilmetta'],
  'Thiruvananthapuram': ['Kowdiar', 'Vellayambalam', 'Sasthamangalam', 'Pattom', 'Kesavadasapuram', 'Kazhakkoottam', 'Technopark'],
  'Mangaluru': ['Kadri', 'Bejai', 'Falnir', 'Balmatta', 'Kankanady', 'Kodialbail', 'Urwa']
];

// South Indian names
const southIndianFirstNames = [
  'Arun', 'Ravi', 'Suresh', 'Venkat', 'Krishna', 'Ramesh', 'Rajesh', 'Ganesh', 'Mahesh', 'Srinivas',
  'Lakshmi', 'Priya', 'Divya', 'Kavitha', 'Meena', 'Saraswati', 'Padma', 'Radha', 'Anjali', 'Sunita',
  'Karthik', 'Vijay', 'Prakash', 'Mohan', 'Sridhar', 'Anand', 'Bala', 'Chandra', 'Deepak', 'Gopal',
  'Anitha', 'Bhavani', 'Chitra', 'Devi', 'Geetha', 'Jaya', 'Kamala', 'Lalitha', 'Nirmala', 'Parvati'
];

const southIndianLastNames = [
  'Kumar', 'Sharma', 'Reddy', 'Nair', 'Menon', 'Pillai', 'Iyer', 'Iyengar', 'Naidu', 'Rao',
  'Patel', 'Chari', 'Hegde', 'Acharya', 'Kamath', 'Shenoy', 'Pai', 'Shetty', 'Bhat', 'Kapur',
  'Subramaniam', 'Krishnamurthy', 'Venkatesan', 'Raghavan', 'Natarajan', 'Sundaram', 'Raman', 'Swamy', 'Murthy', 'Sastry'
];

// Project names
const projectNamePrefixes = [
  'Green', 'Blue', 'Golden', 'Royal', 'Emerald', 'Crystal', 'Silver', 'Platinum', 'Diamond', 'Pearl',
  'Seaside', 'Riverside', 'Lakeview', 'Mountain', 'Valley', 'Garden', 'Palm', 'Coconut', 'Banyan', 'Mango'
];

const projectNameSuffixes = [
  'Residency', 'Heights', 'Towers', 'Enclave', 'Gardens', 'Meadows', 'Villas', 'Apartments', 'Plaza', 'Arcade',
  'Estate', 'Manor', 'Oasis', 'Paradise', 'Haven', 'Retreat', 'Sanctuary', 'Terraces', 'Court', 'Square'
];

// Task types and descriptions
const taskTypes = ['visit_approval', 'site_visit', 'client_assistance', 'maintenance'];
const taskDescriptions = {
  'visit_approval': [
    'Review and approve site visit request',
    'Verify client details for upcoming visit',
    'Prepare documentation for site visit approval'
  ],
  'site_visit': [
    'Accompany client for site tour',
    'Show available plots to prospective buyer',
    'Conduct detailed property walkthrough'
  ],
  'client_assistance': [
    'Help client with documentation',
    'Assist with payment procedures',
    'Provide information about amenities and facilities'
  ],
  'maintenance': [
    'Inspect property condition',
    'Coordinate with maintenance team',
    'Verify completion of maintenance work'
  ]
};

// Leave request reasons
const leaveReasons = [
  'Personal emergency',
  'Family function',
  'Pongal festival celebration',
  'Diwali holidays',
  'Wedding in family',
  'Medical appointment',
  'House warming ceremony',
  'Temple visit for annual festival',
  'Child\'s school function',
  'Visiting relatives in native place'
];

// Announcement titles and messages
const announcementData = [
  {
    title: 'Pongal Holiday Notice',
    message: 'Our office will remain closed from January 14th to 16th for Pongal celebrations. We wish everyone a prosperous Pongal!'
  },
  {
    title: 'New Project Launch: Emerald Heights',
    message: 'We are excited to announce the launch of our new project "Emerald Heights" in Velachery, Chennai. Pre-booking starts next week!'
  },
  {
    title: 'Maintenance Schedule Update',
    message: 'The scheduled maintenance for Green Valley Enclave will be conducted on the coming Sunday. Water supply may be interrupted for a few hours.'
  },
  {
    title: 'Festive Season Discount',
    message: 'Avail special Diwali discounts on all our properties! Limited time offer valid until October 30th.'
  },
  {
    title: 'Annual Client Meet',
    message: 'We invite all our esteemed clients to the Annual Client Meet on November 15th at Hotel Grand Chola, Chennai.'
  }
];

// Feedback comments
const feedbackComments = [
  'The property exceeded my expectations. Very satisfied with the layout and amenities.',
  'The manager was very helpful and knowledgeable about the property details.',
  'The visit was well organized, but I would have liked more information about the surrounding area.',
  'Excellent service! All my queries were addressed promptly.',
  'The property is good but the price seems a bit high compared to similar properties in the area.',
  'Very professional team. Made the whole process smooth and hassle-free.',
  'The site visit was informative but the transportation arrangement could be improved.',
  'I appreciate the detailed explanation about the payment plans and legal documentation.',
  'The property looks promising but I need more time to make a decision.',
  'The manager was punctual and courteous. Overall a good experience.'
];

// Template descriptions
const templateDescriptions = [
  'Standard South Indian layout with Vastu compliance',
  'Modern gated community design with central park',
  'Premium villa layout with individual gardens',
  'Apartment complex with extensive common areas',
  'Mixed development with commercial and residential zones'
];

// Main function to generate and insert all sample data
async function generateSampleData() {
  try {
    console.log('Starting sample data generation...');
    
    // Create batch for efficient writes
    const batch = db.batch();
    
    // Generate users
    const users = await generateUsers();
    
    // Generate projects
    const projects = await generateProjects(users);
    
    // Generate plots for each project
    const plots = await generatePlots(projects);
    
    // Generate visit requests
    await generateVisitRequests(users, projects, plots);
    
    // Generate tasks for managers
    await generateTasks(users, projects, plots);
    
    // Generate attendance records
    await generateAttendance(users, projects);
    
    // Generate leave requests
    await generateLeaveRequests(users);
    
    // Generate announcements
    await generateAnnouncements(users);
    
    // Generate project templates
    await generateTemplates(users);
    
    // Generate feedback
    await generateFeedback(users, projects);
    
    // Generate system configuration
    await generateSystemConfig();
    
    console.log('Sample data generation completed successfully!');
  } catch (error) {
    console.error('Error generating sample data:', error);
  }
}

// Generate users for all roles
async function generateUsers() {
  console.log('Generating users...');
  
  const userRoles = ['super-admin', 'admin', 'manager', 'client', 'guest'];
  const users: Record<string, any[]> = {
    'super-admin': [],
    'admin': [],
    'manager': [],
    'client': [],
    'guest': []
  };
  
  // Create one super admin
  const superAdminData = {
    uid: 'sa-' + Date.now().toString(),
    email: 'superadmin@realestate.in',
    password: 'Password123',
    displayName: 'Rajesh Kumar',
    phoneNumber: '+91' + getRandomInt(7000000000, 9999999999).toString(),
    role: 'super-admin'
  };
  
  try {
    // Create user in Firebase Auth
    await auth.createUser({
      uid: superAdminData.uid,
      email: superAdminData.email,
      password: superAdminData.password,
      displayName: superAdminData.displayName,
      phoneNumber: superAdminData.phoneNumber
    });
    
    // Set custom claims for role
    await auth.setCustomUserClaims(superAdminData.uid, { role: 'super-admin' });
    
    // Store user in Firestore
    await db.collection('users').doc(superAdminData.uid).set({
      email: superAdminData.email,
      displayName: superAdminData.displayName,
      phoneNumber: superAdminData.phoneNumber,
      role: 'super-admin',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    users['super-admin'].push(superAdminData);
    console.log(`Created super admin: ${superAdminData.email}`);
  } catch (error) {
    console.error('Error creating super admin:', error);
  }
  
  // Create 3 admins
  for (let i = 0; i < 3; i++) {
    const firstName = getRandomItem(southIndianFirstNames);
    const lastName = getRandomItem(southIndianLastNames);
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}${i}@realestate.in`;
    
    const adminData = {
      uid: 'admin-' + Date.now().toString() + i,
      email: email,
      password: 'Password123',
      displayName: fullName,
      phoneNumber: '+91' + getRandomInt(7000000000, 9999999999).toString(),
      role: 'admin'
    };
    
    try {
      // Create user in Firebase Auth
      await auth.createUser({
        uid: adminData.uid,
        email: adminData.email,
        password: adminData.password,
        displayName: adminData.displayName,
        phoneNumber: adminData.phoneNumber
      });
      
      // Set custom claims for role
      await auth.setCustomUserClaims(adminData.uid, { role: 'admin' });
      
      // Store user in Firestore
      await db.collection('users').doc(adminData.uid).set({
        email: adminData.email,
        displayName: adminData.displayName,
        phoneNumber: adminData.phoneNumber,
        role: 'admin',
        city: getRandomItem(southIndianCities),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      
      users['admin'].push(adminData);
      console.log(`Created admin: ${adminData.email}`);
    } catch (error) {
      console.error(`Error creating admin ${i}:`, error);
    }
  }
  
  // Create 10 managers
  for (let i = 0; i < 10; i++) {
    const firstName = getRandomItem(southIndianFirstNames);
    const lastName = getRandomItem(southIndianLastNames);
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}${i}@realestate.in`;
    const city = getRandomItem(southIndianCities);
    
    const managerData = {
      uid: 'manager-' + Date.now().toString() + i,
      email: email,
      password: 'Password123',
      displayName: fullName,
      phoneNumber: '+91' + getRandomInt(7000000000, 9999999999).toString(),
      role: 'manager',
      city: city
    };
    
    try {
      // Create user in Firebase Auth
      await auth.createUser({
        uid: managerData.uid,
        email: managerData.email,
        password: managerData.password,
        displayName: managerData.displayName,
        phoneNumber: managerData.phoneNumber
      });
      
      // Set custom claims for role
      await auth.setCustomUserClaims(managerData.uid, { role: 'manager' });
      
      // Store user in Firestore
      await db.collection('users').doc(managerData.uid).set({
        email: managerData.email,
        displayName: managerData.displayName,
        phoneNumber: managerData.phoneNumber,
        role: 'manager',
        city: city,
        address: `${getRandomInt(1, 100)}, ${getRandomItem(localitiesByCity[city])}, ${city}`,
        joinDate: createTimestamp(-getRandomInt(30, 365)),
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      
      users['manager'].push(managerData);
      console.log(`Created manager: ${managerData.email}`);
    } catch (error) {
      console.error(`Error creating manager ${i}:`, error);
    }
  }
  
  // Create 20 clients
  for (let i = 0; i < 20; i++) {
    const firstName = getRandomItem(southIndianFirstNames);
    const lastName = getRandomItem(southIndianLastNames);
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}@gmail.com`;
    const city = getRandomItem(southIndianCities);
    
    const clientData = {
      uid: 'client-' + Date.now().toString() + i,
      email: email,
      password: 'Password123',
      displayName: fullName,
      phoneNumber: '+91' + getRandomInt(7000000000, 9999999999).toString(),
      role: 'client',
      city: city
    };
    
    try {
      // Create user in Firebase Auth
      await auth.createUser({
        uid: clientData.uid,
        email: clientData.email,
        password: clientData.password,
        displayName: clientData.displayName,
        phoneNumber: clientData.phoneNumber
      });
      
      // Set custom claims for role
      await auth.setCustomUserClaims(clientData.uid, { role: 'client' });
      
      // Store user in Firestore
      await db.collection('users').doc(clientData.uid).set({
        email: clientData.email,
        displayName: clientData.displayName,
        phoneNumber: clientData.phoneNumber,
        role: 'client',
        city: city,
        address: `${getRandomInt(1, 100)}, ${getRandomItem(localitiesByCity[city])}, ${city}`,
        joinDate: createTimestamp(-getRandomInt(1, 180)),
        isPermanent: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      
      users['client'].push(clientData);
      console.log(`Created client: ${clientData.email}`);
    } catch (error) {
      console.error(`Error creating client ${i}:`, error);
    }
  }
  
  // Create 15 guests
  for (let i = 0; i < 15; i++) {
    const firstName = getRandomItem(southIndianFirstNames);
    const lastName = getRandomItem(southIndianLastNames);
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}@gmail.com`;
    const city = getRandomItem(southIndianCities);
    
    const guestData = {
      uid: 'guest-' + Date.now().toString() + i,
      email: email,
      password: 'Password123',
      displayName: fullName,
      phoneNumber: '+91' + getRandomInt(7000000000, 9999999999).toString(),
      role: 'guest',
      city: city
    };
    
    try {
      // Create user in Firebase Auth
      await auth.createUser({
        uid: guestData.uid,
        email: guestData.email,
        password: guestData.password,
        displayName: guestData.displayName,
        phoneNumber: guestData.phoneNumber
      });
      
      // Set custom claims for role
      await auth.setCustomUserClaims(guestData.uid, { role: 'guest' });
      
      // Store user in Firestore
      await db.collection('users').doc(guestData.uid).set({
        email: guestData.email,
        displayName: guestData.displayName,
        phoneNumber: guestData.phoneNumber,
        role: 'guest',
        city: city,
        address: `${getRandomInt(1, 100)}, ${getRandomItem(localitiesByCity[city])}, ${city}`,
        joinDate: createTimestamp(-getRandomInt(1, 30)),
        isTemporary: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      
      users['guest'].push(guestData);
      console.log(`Created guest: ${guestData.email}`);
    } catch (error) {
      console.error(`Error creating guest ${i}:`, error);
    }
  }
  
  return users;
}

// Generate projects
async function generateProjects(users: Record<string, any[]>) {
  console.log('Generating projects...');
  
  const projects = [];
  const admins = users['admin'];
  
  // Create 8 projects
  for (let i = 0; i < 8; i++) {
    const city = getRandomItem(southIndianCities);
    const projectNamePrefix = getRandomItem(projectNamePrefixes);
    const projectNameSuffix = getRandomItem(projectNameSuffixes);
    const projectName = `${projectNamePrefix} ${projectNameSuffix}`;
    
    // Calculate coordinates for the city (approximate)
    let latitude, longitude;
    switch (city) {
      case 'Chennai':
        latitude = 13.0827 + (Math.random() * 0.05 - 0.025);
        longitude = 80.2707 + (Math.random() * 0.05 - 0.025);
        break;
      case 'Bengaluru':
        latitude = 12.9716 + (Math.random() * 0.05 - 0.025);
        longitude = 77.5946 + (Math.random() * 0.05 - 0.025);
        break;
      case 'Hyderabad':
        latitude = 17.3850 + (Math.random() * 0.05 - 0.025);
        longitude = 78.4867 + (Math.random() * 0.05 - 0.025);
        break;
      case 'Kochi':
        latitude = 9.9312 + (Math.random() * 0.05 - 0.025);
        longitude = 76.2673 + (Math.random() * 0.05 - 0.025);
        break;
      case 'Coimbatore':
        latitude = 11.0168 + (Math.random() * 0.05 - 0.025);
        longitude = 76.9558 + (Math.random() * 0.05 - 0.025);
        break;
      default:
        latitude = 13.0827 + (Math.random() * 0.05 - 0.025);
        longitude = 80.2707 + (Math.random() * 0.05 - 0.025);
    }
    
    // Create grid size
    const rows = getRandomInt(5, 10);
    const cols = getRandomInt(5, 10);
    const totalPlots = Math.floor(rows * cols * 0.7); // Approximately 70% of cells are plots
    
    const projectId = 'project-' + Date.now().toString() + i;
    const adminId = admins[i % admins.length].uid;
    
    // Create project document
    const projectData = {
      id: projectId,
      name: projectName,
      description: `${projectName} is a premium ${getRandomItem(['residential', 'commercial', 'mixed-use'])} development located in ${getRandomItem(localitiesByCity[city])}, ${city}.`,
      location: `${getRandomItem(localitiesByCity[city])}, ${city}`,
      totalPlots: totalPlots,
      availablePlots: Math.floor(totalPlots * (0.3 + Math.random() * 0.4)), // 30-70% available
      plotSizes: `${getRandomInt(1000, 2000)}-${getRandomInt(2001, 3000)} sq.ft`,
      startingPrice: getRandomInt(3000, 8000) * 1000, // 30-80 lakhs
      status: getRandomItem(['active', 'completed', 'upcoming']),
      imageUrl: `https://source.unsplash.com/random/800x600/?realestate,${projectNamePrefix.toLowerCase()}`,
      createdAt: createTimestamp(-getRandomInt(30, 365)),
      updatedAt: createTimestamp(-getRandomInt(1, 30)),
      latitude: latitude,
      longitude: longitude,
      geofenceRadius: getRandomInt(100, 500), // in meters
      gridSize: {
        rows: rows,
        cols: cols
      },
      createdBy: adminId,
      city: city
    };
    
    try {
      await db.collection('projects').doc(projectId).set(projectData);
      projects.push(projectData);
      console.log(`Created project: ${projectName}`);
    } catch (error) {
      console.error(`Error creating project ${projectName}:`, error);
    }
  }
  
  return projects;
}

// Generate plots for each project
async function generatePlots(projects: any[]) {
  console.log('Generating plots...');
  
  const plots = [];
  
  for (const project of projects) {
    const { id: projectId, gridSize, totalPlots } = project;
    const { rows, cols } = gridSize;
    
    // Create grid cells
    const gridCells: any[][] = [];
    for (let r = 0; r < rows; r++) {
      gridCells[r] = [];
      for (let c = 0; c < cols; c++) {
        gridCells[r][c] = {
          row: r,
          col: c,
          type: 'empty'
        };
      }
    }
    
    // Create roads (horizontal and vertical)
    const horizontalRoadRow = Math.floor(rows / 2);
    const verticalRoadCol = Math.floor(cols / 2);
    
    // Horizontal road
    for (let c = 0; c < cols; c++) {
      gridCells[horizontalRoadRow][c] = {
        row: horizontalRoadRow,
        col: c,
        type: 'road'
      };
    }
    
    // Vertical road
    for (let r = 0; r < rows; r++) {
      gridCells[r][verticalRoadCol] = {
        row: r,
        col: verticalRoadCol,
        type: 'road'
      };
    }
    
    // Add some amenities
    const amenityPositions = [
      { row: 0, col: 0 },
      { row: 0, col: cols - 1 },
      { row: rows - 1, col: 0 },
      { row: rows - 1, col: cols - 1 }
    ];
    
    for (const pos of amenityPositions) {
      if (Math.random() > 0.5) {
        gridCells[pos.row][pos.col] = {
          row: pos.row,
          col: pos.col,
          type: 'amenity',
          description: getRandomItem(['Park', 'Playground', 'Community Center', 'Temple', 'Shopping Area'])
        };
      }
    }
    
    // Fill remaining cells with plots
    let plotNumber = 1;
    const plotsData = [];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (gridCells[r][c].type === 'empty') {
          const plotSize = getRandomInt(1000, 3000);
          const plotPrice = plotSize * getRandomInt(3000, 8000);
          const plotStatus = Math.random() < 0.3 ? 'sold' : (Math.random() < 0.5 ? 'reserved' : 'available');
          
          const plotData = {
            row: r,
            col: c,
            type: 'plot',
            plotNumber: plotNumber,
            size: plotSize,
            price: plotPrice,
            description: `${plotSize} sq.ft plot with excellent location`,
            status: plotStatus
          };
          
          gridCells[r][c] = plotData;
          
          // Create plot document
          const plotId = `${projectId}-plot-${plotNumber}`;
          const plot = {
            id: plotId,
            projectId: projectId,
            plotNumber: plotNumber,
            row: r,
            col: c,
            size: plotSize,
            price: plotPrice,
            status: plotStatus,
            type: 'plot',
            address: `Plot ${plotNumber}, ${project.name}, ${project.location}`
          };
          
          if (plotStatus === 'sold') {
            plot.ownerId = getRandomItem([...Array(20)].map((_, i) => `client-${i}`));
            plot.purchaseDate = createTimestamp(-getRandomInt(1, 180));
          }
          
          try {
            await db.collection('plots').doc(plotId).set(plot);
            plotsData.push(plot);
            console.log(`Created plot: ${plotId}`);
          } catch (error) {
            console.error(`Error creating plot ${plotId}:`, error);
          }
          
          plotNumber++;
        }
      }
    }
    
    // Update project with grid cells
    try {
      await db.collection('projects').doc(projectId).update({
        gridCells: gridCells
      });
      console.log(`Updated project ${projectId} with grid cells`);
    } catch (error) {
      console.error(`Error updating project ${projectId} with grid cells:`, error);
    }
    
    plots.push(...plotsData);
  }
  
  return plots;
}

// Generate visit requests
async function generateVisitRequests(users: Record<string, any[]>, projects: any[], plots: any[]) {
  console.log('Generating visit requests...');
  
  const clients = users['client'];
  const guests = users['guest'];
  const managers = users['manager'];
  
  // Generate time slots
  const timeSlots = [];
  for (let d = 0; d < 14; d++) { // Generate slots for next 14 days
    const date = new Date();
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    
    // Morning slots
    for (let h = 10; h < 13; h++) {
      timeSlots.push({
        id: `slot-${dateStr}-${h}`,
        startTime: `${h}:00`,
        endTime: `${h}:30`,
        date: dateStr,
        available: Math.random() > 0.3 // 70% available
      });
    }
    
    // Afternoon slots
    for (let h = 14; h < 17; h++) {
      timeSlots.push({
        id: `slot-${dateStr}-${h}`,
        startTime: `${h}:00`,
        endTime: `${h}:30`,
        date: dateStr,
        available: Math.random() > 0.3 // 70% available
      });
    }
  }
  
  // Create 30 visit requests (mix of client and guest)
  for (let i = 0; i < 30; i++) {
    const isClient = Math.random() > 0.4; // 60% from clients
    const user = isClient ? getRandomItem(clients) : getRandomItem(guests);
    const project = getRandomItem(projects);
    const availablePlots = plots.filter(p => p.projectId === project.id && p.status === 'available');
    const plot = availablePlots.length > 0 ? getRandomItem(availablePlots) : null;
    const timeSlot = getRandomItem(timeSlots.filter(ts => ts.available));
    
    // Mark the time slot as unavailable
    timeSlot.available = false;
    
    // Generate QR code token for some requests
    const hasQrCode = Math.random() > 0.5;
    const qrCodeToken = hasQrCode ? `qr-${Date.now().toString()}-${i}` : undefined;
    const qrCodeExpiry = hasQrCode ? createTimestamp(7) : undefined;
    
    // Determine status
    let status: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'completed';
    const randomStatus = Math.random();
    if (randomStatus < 0.3) {
      status = 'pending';
    } else if (randomStatus < 0.6) {
      status = 'approved';
    } else if (randomStatus < 0.7) {
      status = 'rejected';
    } else if (randomStatus < 0.8) {
      status = 'checked-in';
    } else {
      status = 'completed';
    }
    
    // Assign to manager for approved, checked-in, or completed
    const assignedTo = ['approved', 'checked-in', 'completed'].includes(status) 
      ? getRandomItem(managers).uid 
      : undefined;
    
    const assignedAt = assignedTo ? createTimestamp(-1) : undefined;
    
    const visitRequestId = `visit-${Date.now().toString()}-${i}`;
    const visitRequest = {
      id: visitRequestId,
      userId: user.uid,
      userName: user.displayName,
      userEmail: user.email,
      userPhone: user.phoneNumber,
      projectId: project.id,
      projectName: project.name,
      plotId: plot ? plot.id : undefined,
      plotNumber: plot ? plot.plotNumber : undefined,
      timeSlotId: timeSlot.id,
      timeSlot: {
        date: timeSlot.date,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime
      },
      status: status,
      qrCodeToken: qrCodeToken,
      qrCodeExpiry: qrCodeExpiry,
      notes: Math.random() > 0.7 ? 'Interested in corner plots with east facing' : undefined,
      createdAt: createTimestamp(-getRandomInt(1, 14)),
      updatedAt: createTimestamp(-getRandomInt(0, 3)),
      isClient: isClient,
      assignedTo: assignedTo,
      assignedAt: assignedAt
    };
    
    try {
      await db.collection('visitRequests').doc(visitRequestId).set(visitRequest);
      console.log(`Created visit request: ${visitRequestId}`);
    } catch (error) {
      console.error(`Error creating visit request ${visitRequestId}:`, error);
    }
  }
}

// Generate tasks for managers
async function generateTasks(users: Record<string, any[]>, projects: any[], plots: any[]) {
  console.log('Generating tasks for managers...');
  
  const managers = users['manager'];
  const clients = users['client'];
  
  // Create 40 tasks
  for (let i = 0; i < 40; i++) {
    const manager = getRandomItem(managers);
    const taskType = getRandomItem(taskTypes);
    const project = getRandomItem(projects);
    const availablePlots = plots.filter(p => p.projectId === project.id);
    const plot = availablePlots.length > 0 ? getRandomItem(availablePlots) : null;
    const client = getRandomItem(clients);
    
    // Determine status
    let status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    const randomStatus = Math.random();
    if (randomStatus < 0.3) {
      status = 'pending';
    } else if (randomStatus < 0.6) {
      status = 'in_progress';
    } else if (randomStatus < 0.9) {
      status = 'completed';
    } else {
      status = 'cancelled';
    }
    
    // Get description based on task type
    const description = getRandomItem(taskDescriptions[taskType]);
    
    // Create task
    const taskId = `task-${Date.now().toString()}-${i}`;
    const task = {
      id: taskId,
      managerId: manager.uid,
      managerName: manager.displayName,
      taskType: taskType,
      title: `${taskType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${project.name}`,
      description: description,
      status: status,
      priority: getRandomItem(['low', 'medium', 'high']),
      dueDate: createTimestamp(getRandomInt(1, 7)),
      projectId: project.id,
      projectName: project.name,
      plotId: plot ? plot.id : undefined,
      plotNumber: plot ? plot.plotNumber : undefined,
      clientId: client.uid,
      clientName: client.displayName,
      createdAt: createTimestamp(-getRandomInt(1, 14)),
      updatedAt: createTimestamp(-getRandomInt(0, 3)),
      completedAt: status === 'completed' ? createTimestamp(-getRandomInt(0, 2)) : undefined,
      feedbackSubmitted: status === 'completed' && Math.random() > 0.5
    };
    
    try {
      await db.collection('tasks').doc(taskId).set(task);
      console.log(`Created task: ${taskId}`);
    } catch (error) {
      console.error(`Error creating task ${taskId}:`, error);
    }
  }
}

// Generate attendance records
async function generateAttendance(users: Record<string, any[]>, projects: any[]) {
  console.log('Generating attendance records...');
  
  const managers = users['manager'];
  
  // Generate attendance for the last 30 days
  for (let d = 0; d < 30; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    for (const manager of managers) {
      // 90% attendance rate
      if (Math.random() > 0.9) continue;
      
      const project = getRandomItem(projects);
      
      // Check-in (morning)
      const checkInTime = new Date(date);
      checkInTime.setHours(getRandomInt(9, 10), getRandomInt(0, 59), 0, 0);
      
      // Add small variation to coordinates to simulate different check-in locations
      const latVariation = (Math.random() * 0.002) - 0.001;
      const lngVariation = (Math.random() * 0.002) - 0.001;
      
      const isWithinGeofence = Math.random() > 0.1; // 90% within geofence
      
      const checkInId = `attendance-${manager.uid}-${date.toISOString().split('T')[0]}-in`;
      const checkInRecord = {
        id: checkInId,
        managerId: manager.uid,
        managerName: manager.displayName,
        type: 'check_in',
        timestamp: Timestamp.fromDate(checkInTime),
        location: {
          latitude: project.latitude + latVariation,
          longitude: project.longitude + lngVariation,
          accuracy: getRandomInt(5, 20)
        },
        projectId: project.id,
        projectName: project.name,
        isWithinGeofence: isWithinGeofence,
        notes: !isWithinGeofence ? 'Checked in from outside the geofence area' : undefined
      };
      
      try {
        await db.collection('attendance').doc(checkInId).set(checkInRecord);
        console.log(`Created check-in record: ${checkInId}`);
      } catch (error) {
        console.error(`Error creating check-in record ${checkInId}:`, error);
      }
      
      // Check-out (evening)
      const checkOutTime = new Date(date);
      checkOutTime.setHours(getRandomInt(17, 18), getRandomInt(0, 59), 0, 0);
      
      // Different variation for check-out
      const latVariation2 = (Math.random() * 0.002) - 0.001;
      const lngVariation2 = (Math.random() * 0.002) - 0.001;
      
      const isWithinGeofence2 = Math.random() > 0.1; // 90% within geofence
      
      const checkOutId = `attendance-${manager.uid}-${date.toISOString().split('T')[0]}-out`;
      const checkOutRecord = {
        id: checkOutId,
        managerId: manager.uid,
        managerName: manager.displayName,
        type: 'check_out',
        timestamp: Timestamp.fromDate(checkOutTime),
        location: {
          latitude: project.latitude + latVariation2,
          longitude: project.longitude + lngVariation2,
          accuracy: getRandomInt(5, 20)
        },
        projectId: project.id,
        projectName: project.name,
        isWithinGeofence: isWithinGeofence2,
        notes: !isWithinGeofence2 ? 'Checked out from outside the geofence area' : undefined
      };
      
      try {
        await db.collection('attendance').doc(checkOutId).set(checkOutRecord);
        console.log(`Created check-out record: ${checkOutId}`);
      } catch (error) {
        console.error(`Error creating check-out record ${checkOutId}:`, error);
      }
    }
  }
}

// Generate leave requests
async function generateLeaveRequests(users: Record<string, any[]>) {
  console.log('Generating leave requests...');
  
  const managers = users['manager'];
  const admins = users['admin'];
  
  // Create 20 leave requests
  for (let i = 0; i < 20; i++) {
    const manager = getRandomItem(managers);
    
    // Determine start and end dates
    const startOffset = getRandomInt(1, 30);
    const leaveDuration = getRandomInt(1, 5);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + startOffset);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + leaveDuration - 1);
    
    // Determine status
    let status: 'pending' | 'approved' | 'rejected';
    const randomStatus = Math.random();
    if (randomStatus < 0.4) {
      status = 'pending';
    } else if (randomStatus < 0.9) {
      status = 'approved';
    } else {
      status = 'rejected';
    }
    
    // Approval details
    const approvedBy = status === 'approved' || status === 'rejected' ? getRandomItem(admins).uid : undefined;
    const approvedAt = approvedBy ? createTimestamp(-getRandomInt(1, 5)) : undefined;
    const rejectionReason = status === 'rejected' ? 'High workload during the requested period' : undefined;
    
    const leaveRequestId = `leave-${Date.now().toString()}-${i}`;
    const leaveRequest = {
      id: leaveRequestId,
      managerId: manager.uid,
      managerName: manager.displayName,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      reason: getRandomItem(leaveReasons),
      status: status,
      approvedBy: approvedBy,
      approvedAt: approvedAt,
      rejectionReason: rejectionReason,
      createdAt: createTimestamp(-getRandomInt(5, 15)),
      updatedAt: approvedAt || createTimestamp(-getRandomInt(1, 5))
    };
    
    try {
      await db.collection('leaveRequests').doc(leaveRequestId).set(leaveRequest);
      console.log(`Created leave request: ${leaveRequestId}`);
    } catch (error) {
      console.error(`Error creating leave request ${leaveRequestId}:`, error);
    }
  }
}

// Generate announcements
async function generateAnnouncements(users: Record<string, any[]>) {
  console.log('Generating announcements...');
  
  const admins = [...users['admin'], ...users['super-admin']];
  
  // Create 10 announcements
  for (let i = 0; i < 10; i++) {
    const admin = getRandomItem(admins);
    const selectedAnnouncementData = announcementData[i % announcementData.length];
    const title = selectedAnnouncementData.title;
    const message = selectedAnnouncementData.message;
    
    // Determine target roles
    const targetRoles = [];
    if (Math.random() > 0.3) targetRoles.push('client');
    if (Math.random() > 0.3) targetRoles.push('manager');
    if (Math.random() > 0.7) targetRoles.push('admin');
    if (targetRoles.length === 0) targetRoles.push('client', 'manager'); // Default
    
    const announcementId = `announcement-${Date.now().toString()}-${i}`;
    const announcement = {
      id: announcementId,
      title: title,
      message: message,
      targetRoles: targetRoles,
      publishAt: Math.random() > 0.8 ? createTimestamp(getRandomInt(1, 7)) : undefined,
      createdBy: admin.uid,
      createdAt: createTimestamp(-getRandomInt(1, 30)),
      updatedAt: createTimestamp(-getRandomInt(0, 5))
    };
    
    try {
      await db.collection('announcements').doc(announcementId).set(announcement);
      console.log(`Created announcement: ${announcementId}`);
    } catch (error) {
      console.error(`Error creating announcement ${announcementId}:`, error);
    }
  }
}

// Generate project templates
async function generateTemplates(users: Record<string, any[]>) {
  console.log('Generating project templates...');
  
  const admins = [...users['admin'], ...users['super-admin']];
  
  // Create 5 templates
  for (let i = 0; i < 5; i++) {
    const admin = getRandomItem(admins);
    
    // Create grid size
    const rows = getRandomInt(5, 10);
    const cols = getRandomInt(5, 10);
    
    // Create grid cells
    const gridCells: any[][] = [];
    for (let r = 0; r < rows; r++) {
      gridCells[r] = [];
      for (let c = 0; c < cols; c++) {
        gridCells[r][c] = {
          row: r,
          col: c,
          type: 'empty'
        };
      }
    }
    
    // Create roads (horizontal and vertical)
    const horizontalRoadRow = Math.floor(rows / 2);
    const verticalRoadCol = Math.floor(cols / 2);
    
    // Horizontal road
    for (let c = 0; c < cols; c++) {
      gridCells[horizontalRoadRow][c] = {
        row: horizontalRoadRow,
        col: c,
        type: 'road'
      };
    }
    
    // Vertical road
    for (let r = 0; r < rows; r++) {
      gridCells[r][verticalRoadCol] = {
        row: r,
        col: verticalRoadCol,
        type: 'road'
      };
    }
    
    // Add some amenities
    const amenityPositions = [
      { row: 0, col: 0 },
      { row: 0, col: cols - 1 },
      { row: rows - 1, col: 0 },
      { row: rows - 1, col: cols - 1 }
    ];
    
    for (const pos of amenityPositions) {
      if (Math.random() > 0.5) {
        gridCells[pos.row][pos.col] = {
          row: pos.row,
          col: pos.col,
          type: 'amenity',
          description: getRandomItem(['Park', 'Playground', 'Community Center', 'Temple', 'Shopping Area'])
        };
      }
    }
    
    // Fill remaining cells with plots
    let plotNumber = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (gridCells[r][c].type === 'empty') {
          const plotSize = getRandomInt(1000, 3000);
          const plotPrice = plotSize * getRandomInt(3000, 8000);
          
          gridCells[r][c] = {
            row: r,
            col: c,
            type: 'plot',
            plotNumber: plotNumber,
            size: plotSize,
            price: plotPrice,
            description: `${plotSize} sq.ft plot with excellent location`,
            status: 'available'
          };
          
          plotNumber++;
        }
      }
    }
    
    const templateId = `template-${Date.now().toString()}-${i}`;
    const template = {
      id: templateId,
      name: `Template ${i + 1} - ${getRandomItem(['Standard', 'Premium', 'Budget', 'Luxury', 'Compact'])} Layout`,
      description: getRandomItem(templateDescriptions),
      gridSize: {
        rows: rows,
        cols: cols
      },
      gridCells: gridCells,
      createdBy: admin.uid,
      createdAt: createTimestamp(-getRandomInt(30, 180)),
      updatedAt: createTimestamp(-getRandomInt(0, 30))
    };
    
    try {
      await db.collection('templates').doc(templateId).set(template);
      console.log(`Created template: ${templateId}`);
    } catch (error) {
      console.error(`Error creating template ${templateId}:`, error);
    }
  }
}

// Generate feedback
async function generateFeedback(users: Record<string, any[]>, projects: any[]) {
  console.log('Generating feedback...');
  
  const clients = users['client'];
  const guests = users['guest'];
  
  // Create 25 feedback entries
  for (let i = 0; i < 25; i++) {
    const isClient = Math.random() > 0.4; // 60% from clients
    const user = isClient ? getRandomItem(clients) : getRandomItem(guests);
    
    const feedbackId = `feedback-${Date.now().toString()}-${i}`;
    const feedback = {
      id: feedbackId,
      userId: user.uid,
      rating: getRandomInt(3, 5), // Mostly positive ratings (3-5)
      comment: getRandomItem(feedbackComments),
      createdAt: createTimestamp(-getRandomInt(1, 60)),
      type: Math.random() > 0.5 ? 'visit' : 'service'
    };
    
    try {
      await db.collection('feedback').doc(feedbackId).set(feedback);
      console.log(`Created feedback: ${feedbackId}`);
    } catch (error) {
      console.error(`Error creating feedback ${feedbackId}:`, error);
    }
  }
}

// Generate system configuration
async function generateSystemConfig() {
  console.log('Generating system configuration...');
  
  const systemConfig = {
    geofenceRadius: 200, // Default geofence radius in meters
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    visitSlotDuration: 30, // in minutes
    qrCodeValidity: 24, // in hours
    roles: {
      'super-admin': {
        permissions: ['all']
      },
      'admin': {
        permissions: ['manage_projects', 'manage_managers', 'approve_visits', 'view_analytics']
      },
      'manager': {
        permissions: ['conduct_visits', 'mark_attendance', 'submit_feedback']
      },
      'client': {
        permissions: ['book_visits', 'view_plots', 'generate_qr']
      },
      'guest': {
        permissions: ['book_visits', 'view_public_projects']
      }
    },
    notificationSettings: {
      email: true,
      push: true,
      sms: false
    },
    maintenanceMode: false,
    version: '1.0.0',
    lastUpdated: FieldValue.serverTimestamp()
  };
  
  try {
    await db.collection('system').doc('config').set(systemConfig);
    console.log('Created system configuration');
  } catch (error) {
    console.error('Error creating system configuration:', error);
  }
}

// Execute the main function
generateSampleData();

