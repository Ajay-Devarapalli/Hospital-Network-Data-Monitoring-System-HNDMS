# Hospital Network & Data Monitoring System (HNDMS)

The Hospital Network & Data Monitoring System is a professional enterprise platform developed to monitor hospital infrastructure and system performance. Built using the MERN (MongoDB, Express.js, React, Node.js) stack, it integrates real-time hardware telemetry with comprehensive clinical operations management.

## Project Description
HNDMS is designed to provide hospital administrators and network engineers with full visibility into both clinical operations and system stability. It combines traditional medical management (appointments, patient records, billing) with modern infrastructure monitoring (CPU usage, memory consumption, and network uptime). The system is built for high availability and secure data handling in critical healthcare environments.

## Project Requirements

### 1. Hardware Requirements
| Component | Minimum | Recommended |
| :--- | :--- | :--- |
| Processor | Intel Core i3 (10th Gen+) | Intel Core i5 or higher |
| RAM | 8 GB | 16 GB or higher |
| Storage | 5 GB free disk space | 20 GB free space on SSD |
| Network | Stable Internet Connection | High-speed Broadband |

### 2. Software Requirements
| Category | Requirement Details |
| :--- | :--- |
| Operating System | Windows 10/11 or Linux (Ubuntu 22.04+) |
| Runtime | Node.js v18.0.0 or higher |
| Database | MongoDB (Local or Atlas) |
| Frontend | React.js, Tailwind CSS |
| Backend | Express.js, Node.js |

## Database Setup
1. Create a **MongoDB Atlas** cluster or install MongoDB locally.
2. Create a database named `hospital_management`.
3. In the `backend/.env` file, add your connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hospital_management
   JWT_SECRET=your_secret_key
   ```
4. Run the seed script to populate initial data:
   ```bash
   cd backend
   npm run seed
   ```

## How to Run the Project Locally

### 1. Clone the Repository
```bash
git clone https://github.com/user-name/Hospital-Management-System-MERN-Stack.git
cd Hospital-Management-System-MERN-Stack
```

### 2. Setup the Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Setup the Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Access the Dashboard
Open your browser and navigate to: `http://localhost:5173/`

## Demo Login Credentials
| Role | Email Address | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@hospital.com` | `Admin@123` |
| **Doctor (Senior)** | `alice@hospital.com` | `Doctor@123` |
| **Doctor (Junior)** | `bob@hospital.com` | `Doctor@123` |
| **Nurse** | `carol@hospital.com` | `Nurse@123` |
| **Receptionist** | `david@hospital.com` | `Staff@123` |
| **Patient (Sample A)** | `john@gmail.com` | `Patient@123` |
| **Patient (Sample B)** | `jane@gmail.com` | `Patient@123` |

---
*Note: For more detailed documentation on system workflows and architecture, please refer to the Project Proposal document.*
