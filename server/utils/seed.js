require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const { Lesson, Enrollment, Assignment, Progress, Quiz, Announcement } = require('../models/models');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eduflow');
  console.log('🌱 Seeding database...');

  await Promise.all([
    User.deleteMany(), Course.deleteMany(), Lesson.deleteMany(),
    Enrollment.deleteMany(), Assignment.deleteMany(), Progress.deleteMany(),
    Quiz.deleteMany(), Announcement.deleteMany()
  ]);

  // Users
  const admin      = await User.create({ name:'Admin User',   email:'admin@eduflow.com',  password:'admin123', role:'admin'      });
  const instructor = await User.create({ name:'Alex Carter',  email:'alex@eduflow.com',   password:'pass123',  role:'instructor', bio:'Senior full-stack developer.' });
  const sam        = await User.create({ name:'Sam Rivera',   email:'sam@eduflow.com',    password:'pass123',  role:'learner'     });
  const maya       = await User.create({ name:'Maya Patel',   email:'maya@eduflow.com',   password:'pass123',  role:'learner'     });
  const jordan     = await User.create({ name:'Jordan Lee',   email:'jordan@eduflow.com', password:'pass123',  role:'learner'     });

  // Courses
  const react  = await Course.create({ title:'React.js Fundamentals', description:'Master React hooks, components and state management from scratch.', instructor:instructor._id, category:'Frontend', level:'Beginner',      duration:'8h',  isPublished:true  });
  const node   = await Course.create({ title:'Node.js & Express APIs', description:'Build RESTful APIs with Node.js, Express and MongoDB.',             instructor:instructor._id, category:'Backend',  level:'Intermediate', duration:'10h', isPublished:true  });
  const design = await Course.create({ title:'UI/UX Design Principles',description:'Learn design systems, Figma and user research methods.',            instructor:instructor._id, category:'Design',   level:'Beginner',     duration:'6h',  isPublished:true  });
  const devops = await Course.create({ title:'DevOps & CI/CD',         description:'Docker, Kubernetes, GitHub Actions and deployment pipelines.',       instructor:instructor._id, category:'DevOps',   level:'Advanced',     duration:'12h', isPublished:false });
  const ml     = await Course.create({ title:'Machine Learning Basics', description:'Python, NumPy, Pandas and scikit-learn for ML models.',             instructor:instructor._id, category:'AI/ML',    level:'Intermediate', duration:'14h', isPublished:true  });

  // Lessons
  const l1 = await Lesson.create({ course:react._id, title:'Introduction to React',   type:'video', order:1, duration:'15m' });
  const l2 = await Lesson.create({ course:react._id, title:'JSX and Components',       type:'pdf',   order:2, duration:'20m' });
  const l3 = await Lesson.create({ course:react._id, title:'State and Props',           type:'video', order:3, duration:'25m' });
  const l4 = await Lesson.create({ course:react._id, title:'useEffect Hook',            type:'video', order:4, duration:'20m' });
  const l5 = await Lesson.create({ course:react._id, title:'React Router',              type:'video', order:5, duration:'30m' });
       await Lesson.create({ course:node._id,  title:'Node.js Setup & Basics',    type:'video', order:1, duration:'15m' });
       await Lesson.create({ course:node._id,  title:'Express Routing',            type:'video', order:2, duration:'20m' });
       await Lesson.create({ course:node._id,  title:'RESTful API Design',         type:'pdf',   order:3, duration:'30m' });
       await Lesson.create({ course:node._id,  title:'MongoDB & Mongoose',         type:'video', order:4, duration:'25m' });
       await Lesson.create({ course:design._id,'title':'Design Fundamentals',      type:'video', order:1, duration:'20m' });
       await Lesson.create({ course:design._id,'title':'Color Theory',             type:'pdf',   order:2, duration:'15m' });

  // Enrollments
  await Enrollment.create({ user:sam._id,    course:react._id  });
  await Enrollment.create({ user:sam._id,    course:node._id   });
  await Enrollment.create({ user:maya._id,   course:react._id  });
  await Enrollment.create({ user:maya._id,   course:design._id });
  await Enrollment.create({ user:jordan._id, course:react._id  });
  await Enrollment.create({ user:jordan._id, course:ml._id     });

  // Progress
  await Progress.create({ user:sam._id,    course:react._id,  completedLessons:[l1._id,l2._id],                       completionPercentage:40 });
  await Progress.create({ user:maya._id,   course:react._id,  completedLessons:[l1._id,l2._id,l3._id],                completionPercentage:60 });
  await Progress.create({ user:jordan._id, course:react._id,  completedLessons:[l1._id,l2._id,l3._id,l4._id,l5._id], completionPercentage:100, completedAt:new Date() });

  // Assignments
  const a1 = await Assignment.create({ course:react._id,  title:'Build a Todo App',    description:'Create a functional todo app using React hooks.',             deadline:new Date(Date.now()+7*24*60*60*1000)  });
  const a2 = await Assignment.create({ course:node._id,   title:'REST API Project',     description:'Build a full CRUD API with Express and MongoDB.',             deadline:new Date(Date.now()+14*24*60*60*1000) });
        await Assignment.create({ course:design._id, title:'Design Case Study',   description:'Design a mobile onboarding flow for a fintech app.',         deadline:new Date(Date.now()+21*24*60*60*1000) });

  // Quizzes
  await Quiz.create({ course:react._id, title:'React Basics Quiz', questions:[
    { question:'What hook manages local state?',  options:['useEffect','useState','useRef','useMemo'],  answer:1 },
    { question:'JSX stands for?',                 options:['Java Syntax','JavaScript XML','JSON Extra','Java X'], answer:1 },
    { question:'Props are?',                      options:['Mutable state','Immutable passed data','DB records','CSS props'], answer:1 },
    { question:'Which hook handles side effects?',options:['useState','useCallback','useEffect','useRef'], answer:2 },
  ]});
  await Quiz.create({ course:node._id, title:'Node.js Quiz', questions:[
    { question:'Node.js runs on which engine?', options:['SpiderMonkey','Chakra','V8','Hermes'], answer:2 },
    { question:'Express is a?',                 options:['Database ORM','HTTP framework','Testing tool','Build tool'], answer:1 },
  ]});

  // Announcements
  await Announcement.create({ course:react._id, author:instructor._id, title:'Assignment deadline extended!', body:'The React Todo App deadline has been extended by one week. Use the extra time wisely!' });
  await Announcement.create({ course:node._id,  author:instructor._id, title:'New video uploaded',            body:'Lesson 4 on MongoDB & Mongoose is now available. Check it out!' });

  console.log('\n✅ Seed complete!\n');
  console.log('📋 Login credentials:');
  console.log('  Admin:      admin@eduflow.com  / admin123');
  console.log('  Instructor: alex@eduflow.com   / pass123');
  console.log('  Learner:    sam@eduflow.com    / pass123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
