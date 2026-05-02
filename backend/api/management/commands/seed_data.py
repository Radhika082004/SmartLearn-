from django.core.management.base import BaseCommand
from api.models import Course, CourseModule, Lesson, Skill, Certification, AssessmentQuestion
import random

class Command(BaseCommand):
    help = 'Seeds the database with realistic courses, modules, lessons, and skills to provide a 100% complete demo.'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing old data...')
        Course.objects.all().delete()
        Skill.objects.all().delete()
        Certification.objects.all().delete()
        AssessmentQuestion.objects.all().delete()

        self.stdout.write('Creating Skills...')
        skill_names = [
            'React.js', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS',
            'Python', 'Django', 'FastAPI', 'Node.js', 'Express',
            'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS',
            'Machine Learning', 'Data Science', 'SQL', 'System Design'
        ]
        skills = {}
        for name in skill_names:
            category = 'Frontend' if name in ['React.js', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS'] else \
                       'Backend' if name in ['Python', 'Django', 'FastAPI', 'Node.js', 'Express'] else \
                       'DevOps & Cloud' if name in ['Docker', 'Kubernetes', 'AWS'] else \
                       'Data & AI' if name in ['Machine Learning', 'Data Science'] else 'General'
            skills[name] = Skill.objects.create(name=name, category=category, description=f"Core {name} skills.")

        self.stdout.write('Creating Courses and Curriculums...')
        
        course_data = [
            {
                'title': 'React.js – Complete Guide',
                'description': 'Master React from fundamentals to advanced concepts like Hooks, Context, and Redux.',
                'category': 'Web Development',
                'level': 'intermediate',
                'duration': 42.5,
                'rating': 4.8,
                'price': 89.99,
                'instructor': 'Sarah Drasner',
                'skills': ['React.js', 'JavaScript', 'HTML5'],
                'thumbnail': 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
                'modules': [
                    {'title': 'Getting Started with React', 'lessons': ['What is React?', 'JSX deep dive', 'Building your first Component']},
                    {'title': 'State and Props', 'lessons': ['Understanding State', 'Passing Data with Props', 'Lifting State Up']},
                    {'title': 'React Hooks', 'lessons': ['useState in depth', 'useEffect and Lifecycle', 'Custom Hooks']}
                ]
            },
            {
                'title': 'Machine Learning with Python',
                'description': 'Learn ML algorithms, data preprocessing, and model evaluation using Python and Scikit-learn.',
                'category': 'AI/Data Science',
                'level': 'advanced',
                'duration': 55.0,
                'rating': 4.9,
                'price': 120.00,
                'instructor': 'Andrew Ng',
                'skills': ['Python', 'Machine Learning', 'Data Science'],
                'thumbnail': 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg',
                'modules': [
                    {'title': 'Python Refresher', 'lessons': ['Numpy Basics', 'Pandas for Data Manipulation', 'Matplotlib Plotting']},
                    {'title': 'Supervised Learning', 'lessons': ['Linear Regression', 'Logistic Regression', 'Support Vector Machines']},
                    {'title': 'Unsupervised Learning', 'lessons': ['K-Means Clustering', 'PCA', 'Anomaly Detection']}
                ]
            },
            {
                'title': 'Node.js & Express APIs',
                'description': 'Build fast, scalable backend APIs using Node.js and the Express framework.',
                'category': 'Backend Development',
                'level': 'intermediate',
                'duration': 35.0,
                'rating': 4.7,
                'price': 79.99,
                'instructor': 'Maximilian M.',
                'skills': ['Node.js', 'Express', 'JavaScript'],
                'thumbnail': 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg',
                'modules': [
                    {'title': 'Node Fundamentals', 'lessons': ['The Event Loop', 'Core Modules', 'NPM and Package.json']},
                    {'title': 'Building APIs with Express', 'lessons': ['Routing', 'Middleware', 'Error Handling']},
                    {'title': 'Database Integration', 'lessons': ['Connecting to MongoDB', 'Mongoose Models', 'Authentication']}
                ]
            },
            {
                'title': 'Next.js 15 Masterclass',
                'description': 'Build full-stack React applications with Next.js App Router, Server Actions, and Tailwind.',
                'category': 'Web Development',
                'level': 'advanced',
                'duration': 28.5,
                'rating': 4.9,
                'price': 99.99,
                'instructor': 'Lee Robinson',
                'skills': ['Next.js', 'React.js', 'TypeScript', 'Tailwind CSS'],
                'thumbnail': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg',
                'modules': [
                    {'title': 'App Router Architecture', 'lessons': ['Server vs Client Components', 'File-system Routing', 'Layouts and Templates']},
                    {'title': 'Data Fetching', 'lessons': ['Fetch API', 'Server Actions', 'Caching and Revalidation']},
                    {'title': 'Production Deployment', 'lessons': ['Vercel Deployments', 'Performance Optimization', 'SEO Best Practices']}
                ]
            },
            {
                'title': 'Mastering PostgreSQL',
                'description': 'Deep dive into SQL, database design, optimization, and complex queries.',
                'category': 'Database',
                'level': 'intermediate',
                'duration': 20.0,
                'rating': 4.6,
                'price': 49.99,
                'instructor': 'Hussein Mac',
                'skills': ['PostgreSQL', 'SQL', 'System Design'],
                'thumbnail': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg',
                'modules': [
                    {'title': 'Database Design', 'lessons': ['Normalization', 'Entity-Relationship Diagrams', 'Primary and Foreign Keys']},
                    {'title': 'Advanced SQL', 'lessons': ['Joins & Subqueries', 'Window Functions', 'CTEs']},
                    {'title': 'Performance', 'lessons': ['Indexes', 'Query Execution Plans', 'Connection Pooling']}
                ]
            },
            {
                'title': 'Docker & Kubernetes',
                'description': 'Containerize applications and orchestrate them efficiently using Kubernetes.',
                'category': 'DevOps & Cloud',
                'level': 'advanced',
                'duration': 40.0,
                'rating': 4.8,
                'price': 110.00,
                'instructor': 'Nana Janashia',
                'skills': ['Docker', 'Kubernetes', 'AWS'],
                'thumbnail': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg',
                'modules': [
                    {'title': 'Docker Basics', 'lessons': ['Images and Containers', 'Dockerfiles', 'Docker Compose']},
                    {'title': 'Kubernetes Architecture', 'lessons': ['Pods & Deployments', 'Services & Ingress', 'ConfigMaps & Secrets']},
                    {'title': 'Cloud Deployment', 'lessons': ['EKS Setup', 'CI/CD Pipelines', 'Monitoring']}
                ]
            }
        ]

        for cdata in course_data:
            course = Course.objects.create(
                title=cdata['title'],
                description=cdata['description'],
                category=cdata['category'],
                level=cdata['level'],
                duration_hours=cdata['duration'],
                rating=cdata['rating'],
                price=cdata['price'],
                instructor=cdata['instructor'],
                thumbnail_url=cdata['thumbnail']
            )
            
            for skill_name in cdata['skills']:
                if skill_name in skills:
                    course.skills.add(skills[skill_name])
            
            mod_order = 1
            for mdata in cdata['modules']:
                module = CourseModule.objects.create(
                    course=course,
                    title=mdata['title'],
                    order=mod_order
                )
                mod_order += 1
                
                les_order = 1
                for les_title in mdata['lessons']:
                    Lesson.objects.create(
                        module=module,
                        title=les_title,
                        order=les_order,
                        duration_minutes=random.randint(5, 25),
                        is_preview=(mod_order == 1 and les_order == 1)
                    )
                    les_order += 1

        self.stdout.write('Creating Certifications...')
        cert_data = [
            {
                'title': 'Google Professional Cloud Developer',
                'provider': 'Google Cloud',
                'level': 'Advanced',
                'duration': 12,
                'skills': ['Docker', 'Kubernetes', 'AWS', 'System Design'],
                'description': 'Demonstrate your ability to build, deploy, and manage scalable cloud applications.'
            },
            {
                'title': 'Meta Front-End Developer Professional Certificate',
                'provider': 'Meta',
                'level': 'Beginner',
                'duration': 24,
                'skills': ['React.js', 'JavaScript', 'HTML5', 'CSS3'],
                'description': 'Master the principles of front-end development and build responsive websites.'
            },
            {
                'title': 'AWS Certified Solutions Architect – Associate',
                'provider': 'Amazon Web Services',
                'level': 'Intermediate',
                'duration': 16,
                'skills': ['AWS', 'System Design', 'Docker'],
                'description': 'Showcase your knowledge of architecting secure and robust applications on AWS.'
            },
            {
                'title': 'IBM Data Science Professional Certificate',
                'provider': 'IBM',
                'level': 'Beginner',
                'duration': 40,
                'skills': ['Python', 'Data Science', 'SQL', 'Machine Learning'],
                'description': 'Kickstart your career in data science with hands-on skills in Python and SQL.'
            },
            {
                'title': 'TensorFlow Developer Certificate',
                'provider': 'Google',
                'level': 'Advanced',
                'duration': 8,
                'skills': ['Machine Learning', 'Python'],
                'description': 'Validate your expertise in building and training neural networks with TensorFlow.'
            },
            {
                'title': 'Certified Kubernetes Administrator (CKA)',
                'provider': 'Cloud Native Computing Foundation',
                'level': 'Advanced',
                'duration': 10,
                'skills': ['Kubernetes', 'Docker', 'Linux'],
                'description': 'Master the skills to install, configure, and manage production-grade Kubernetes clusters.'
            }
        ]

        for cdata in cert_data:
            cert = Certification.objects.create(
                title=cdata['title'],
                provider=cdata['provider'],
                level=cdata['level'],
                duration_weeks=cdata['duration'],
                description=cdata['description']
            )
            for skill_name in cdata['skills']:
                if skill_name in skills:
                    cert.required_skills.add(skills[skill_name])

        self.stdout.write('Creating Assessment Questions (100 total)...')
        questions_pool = [
            # WEB DEVELOPMENT (20)
            {"domain": "web", "skill": "React.js", "text": "What is the primary purpose of React's Virtual DOM?", "opts": ["To boost speed by direct DOM manipulation", "To minimize direct DOM updates for better performance", "To provide a secure environment for JavaScript", "To store data globally across the app"], "ans": 1},
            {"domain": "web", "skill": "CSS3", "text": "In CSS, what is the 'Box Model'?", "opts": ["A way to draw boxes with Canvas", "A layout engine for flexbox", "The structure of padding, border, and margin around content", "A method for 3D animations"], "ans": 2},
            {"domain": "web", "skill": "JavaScript", "text": "Which HTTP status code represents 'Internal Server Error'?", "opts": ["404", "200", "500", "403"], "ans": 2},
            {"domain": "web", "skill": "JavaScript", "text": "What does the JS 'map()' function return?", "opts": ["A modified original array", "A new array with transformed elements", "A single value", "A boolean"], "ans": 1},
            {"domain": "web", "skill": "HTML5", "text": "What is the use of 'Semantic HTML'?", "opts": ["To make code look pretty", "To provide meaning and accessibility to web content", "To speed up page load", "To replace CSS attributes"], "ans": 1},
            {"domain": "web", "skill": "JavaScript", "text": "What is 'Hoisting' in JavaScript?", "opts": ["Moving declarations to the top of their scope", "Improving memory management", "A way to lift components", "Data binding in frameworks"], "ans": 0},
            {"domain": "web", "skill": "JavaScript", "text": "What is the difference between '==' and '===' in JS?", "opts": ["No difference", "== checks value, === checks value and type", "== is for strings only", "=== is obsolete"], "ans": 1},
            {"domain": "web", "skill": "React.js", "text": "What is a 'Pure Component' in React?", "opts": ["One that doesn't use hooks", "One that only renders and doesn't affect state", "One that re-renders only if props change", "A component without a class"], "ans": 2},
            {"domain": "web", "skill": "JavaScript", "text": "What is CORS?", "opts": ["A type of database", "A mechanism for restricted resource sharing from another domain", "A CSS framework", "A JavaScript bundler"], "ans": 1},
            {"domain": "web", "skill": "Docker", "text": "What is the purpose of 'Docker' in web development?", "opts": ["To design UI", "To containerize applications for consistency", "To write faster Python", "To manage databases only"], "ans": 1},
            {"domain": "web", "skill": "React.js", "text": "Which React hook is used for persistent values that don't trigger re-renders?", "opts": ["useState", "useEffect", "useRef", "useMemo"], "ans": 2},
            {"domain": "web", "skill": "CSS3", "text": "In CSS, 'z-index' only works with...", "opts": ["Relative positioning", "Positioned elements (relative, absolute, fixed, sticky)", "Images only", "Flexbox containers"], "ans": 1},
            {"domain": "web", "skill": "Next.js", "text": "What is 'Hydration' in Next.js?", "opts": ["Memory leak prevention", "Attaching interactivity to server-rendered HTML", "Cleaning the cache", "Loading images lazily"], "ans": 1},
            {"domain": "web", "skill": "Node.js", "text": "What does 'npm' stand for?", "opts": ["Network Project Manager", "Node Package Manager", "New Project Method", "Nuanced Programming Module"], "ans": 1},
            {"domain": "web", "skill": "JavaScript", "text": "What is the purpose of a 'CSRF' token?", "opts": ["To optimize images", "To prevent Cross-Site Request Forgery attacks", "To speed up DNS lookups", "To cache API responses"], "ans": 1},
            {"domain": "web", "skill": "JavaScript", "text": "How do you define a constant in ES6?", "opts": ["var", "let", "const", "def"], "ans": 2},
            {"domain": "web", "skill": "CSS3", "text": "What is 'Responsive Design'?", "opts": ["Websites that load within 1s", "Content that adapts to different screen sizes", "Using only React", "Interactive animations"], "ans": 1},
            {"domain": "web", "skill": "JavaScript", "text": "What is the use of 'async/await'?", "opts": ["To pause thread execution", "To write asynchronous code in a synchronous manner", "To loop through arrays", "To style components"], "ans": 1},
            {"domain": "web", "skill": "HTML5", "text": "Which tag is used for the largest heading in HTML?", "opts": ["<head>", "<h6>", "<h1>", "<big>"], "ans": 2},
            {"domain": "web", "skill": "JavaScript", "text": "What is the 'Closure' in JavaScript?", "opts": ["A way to end a script", "A function bundled with its lexical environment", "An error handling block", "A self-executing function"], "ans": 1},

            # DATA SCIENCE (20)
            {"domain": "ds", "skill": "Data Science", "text": "What is the primary goal of 'Data Cleaning'?", "opts": ["To make charts look better", "To remove errors and inconsistencies from data", "To increase the dataset size", "To encrypt data"], "ans": 1},
            {"domain": "ds", "skill": "Pandas", "text": "Which library is used in Python for data manipulation and analysis?", "opts": ["Matplotlib", "Pandas", "PyQt", "Flask"], "ans": 1},
            {"domain": "ds", "skill": "Data Science", "text": "What is a 'P-value' in statistics?", "opts": ["Probability of seeing the data if null hypothesis is true", "Percentage of accurate results", "Predictive accuracy", "Peak value in a distribution"], "ans": 0},
            {"domain": "ds", "skill": "Machine Learning", "text": "What is 'Overfitting'?", "opts": ["A model performing well on test data but poorly on training", "A model learning noise as patterns", "Merging too many datasets", "Using too much RAM"], "ans": 1},
            {"domain": "ds", "skill": "Data Science", "text": "What is 'R-squared'?", "opts": ["The coefficient of determination", "The square of residuals", "The rate of success", "Correlation between two categorical variables"], "ans": 0},
            {"domain": "ds", "skill": "Data Science", "text": "Which chart type is best for showing correlation between two variables?", "opts": ["Bar chart", "Pie chart", "Scatter plot", "Histogram"], "ans": 2},
            {"domain": "ds", "skill": "Data Science", "text": "What is 'Standard Deviation'?", "opts": ["Measure of central tendency", "Measure of data spread around the mean", "The highest value in a set", "The average of all values"], "ans": 1},
            {"domain": "ds", "skill": "Data Science", "text": "What is 'One-Hot Encoding'?", "opts": ["Reducing decimal places", "Converting categorical variables into binary vectors", "Sorting data in ascending order", "Compressing files"], "ans": 1},
            {"domain": "ds", "skill": "Machine Learning", "text": "What is the purpose of 'Cross-Validation'?", "opts": ["To check code for errors", "To evaluate model performance on unseen data subsets", "To compare two different models", "To merge training and testing data"], "ans": 1},
            {"domain": "ds", "skill": "Data Science", "text": "Which Python library is mostly used for plotting high-quality graphs?", "opts": ["BeautifulSoup", "Scrapy", "Seaborn", "Django"], "ans": 2},
            {"domain": "ds", "skill": "Data Science", "text": "What is a 'Box Plot' used for?", "opts": ["Box plotting", "Visualizing distribution and detecting outliers", "Drawing UI boxes", "Flowcharting"], "ans": 1},
            {"domain": "ds", "skill": "Machine Learning", "text": "What is the difference between supervised and unsupervised learning?", "opts": ["One uses labels, the other doesn't", "One is faster than the other", "One uses neural networks, the other doesn't", "There is no real difference"], "ans": 0},
            {"domain": "ds", "skill": "Data Science", "text": "What is 'Dimensionality Reduction'?", "opts": ["Moving to a smaller server", "Reducing the number of input variables", "Decreasing image resolution", "Reducing database entries"], "ans": 1},
            {"domain": "ds", "skill": "Data Science", "text": "What is 'ETL'?", "opts": ["Entry Time Logistic", "Extract, Transform, Load", "Extra Testing Level", "Electronic Training Label"], "ans": 1},
            {"domain": "ds", "skill": "Data Science", "text": "What is the 'Central Limit Theorem'?", "opts": ["Limit of data storage", "Distribution of sample means becomes normal as sample size increases", "All data must be positive", "Mean is always equal to median"], "ans": 1},
            {"domain": "ds", "skill": "Data Science", "text": "What is 'Imputation' in data science?", "opts": ["Deleting a column", "Replacing missing values with estimated ones", "Assigning a penalty", "Training a model"], "ans": 1},
            {"domain": "ds", "skill": "Data Science", "text": "What is 'Multicollinearity'?", "opts": ["Multiple data sources", "High correlation between independent variables", "Low variance in data", "Multiple output labels"], "ans": 1},
            {"domain": "ds", "skill": "Machine Learning", "text": "Which of these is a classification algorithm?", "opts": ["Linear Regression", "K-Means", "Logistic Regression", "PCA"], "ans": 2},
            {"domain": "ds", "skill": "Data Science", "text": "What is 'A/B Testing'?", "opts": ["Testing only 2 variables", "Randomized experiment comparing two versions", "Algorithm benchmarking", "Alpha-Beta pruning"], "ans": 1},
            {"domain": "ds", "skill": "Data Science", "text": "What is 'F1-Score'?", "opts": ["Formula 1 racing stats", "Harmonic mean of precision and recall", "Accuracy only", "Function 1 output"], "ans": 1},

            # AI/ML (20)
            {"domain": "ai", "skill": "Machine Learning", "text": "What is a 'Neural Network'?", "opts": ["A computer network for AI", "An algorithm inspired by the human brain", "Advanced database indexing", "Internet of Things"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is 'Backpropagation' used for?", "opts": ["Moving data between servers", "Training neural networks by calculating gradients", "Scanning files for viruses", "Reverse-engineering code"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What does 'GAN' stand for?", "opts": ["Generative Adversarial Network", "General Artificial Node", "Global AI Net", "Graphical Action Network"], "ans": 0},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is 'Deep Learning'?", "opts": ["Learning very fast", "Machine learning task with many layers of neural networks", "Learning from giant books", "Quantum computing AI"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is 'Transfer Learning'?", "opts": ["Transferring data to cloud", "Using a pre-trained model for a new similar task", "Moving model between languages", "Learning while sleeping"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is an 'Activation Function'?", "opts": ["A button to start AI", "A function that determines if a neuron should fire", "Memory management tool", "Data loader function"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is 'Natural Language Processing' (NLP)?", "opts": ["Speaking to computers in binary", "Processing and understanding human language by AI", "Speed reading software", "A new C++ compiler"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is 'Reinforcement Learning'?", "opts": ["Harder training", "Learning through rewards and penalties", "Repeating the same data forever", "Learning from manuals only"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "Which of these is a deep learning framework?", "opts": ["NumPy", "PyTorch", "Flask", "Matplotlib"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is 'Turing Test' designed to assess?", "opts": ["Speed of a CPU", "Machine's ability to exhibit intelligent behavior equivalent to a human", "Capacity of hard drive", "Network latency"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is a 'Learning Rate'?", "opts": ["Speed of reading data", "Hyperparameter that controls how much to change the model in response to error", "Percentage of data learned", "Time taken per epoch"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is 'Computer Vision'?", "opts": ["Glasses for computers", "AI field enabling computers to derive information from images/videos", "3D rendering", "A type of screen"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is 'Stochastic Gradient Descent'?", "opts": ["A random walk", "Iterative method for optimizing an objective function with randomness", "Sorting algorithm", "Type of neuron"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is 'Bias' in Machine Learning?", "opts": ["Prejudice in data", "Simplifying assumptions made by a model", "System clock error", "Intentional wrong answers"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is 'Clustering'?", "opts": ["Group of servers", "Unsupervised task of grouping similar data points", "Sorting a list", "Deleting duplicates"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is an 'Ensemble Method'?", "opts": ["A music group", "Combining multiple models to improve performance", "Using 10 GPUs", "A type of data entry"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is 'Precision' in classification?", "opts": ["Being very careful", "Ratio of correctly predicted positive observations to total predicted positives", "Accuracy", "Recall speed"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is 'AutoML'?", "opts": ["Cars driven by AI", "Automated process of end-to-end machine learning", "AI that writes Java", "Automatic data entry"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What are 'Hyperparameters'?", "opts": ["Parameters that can't be changed", "Settings defined before the learning process begins", "Results of the model", "Speed of the CPU"], "ans": 1},
            {"domain": "ai", "skill": "Machine Learning", "text": "What is 'LSTMs' often used for?", "opts": ["Storing images", "Sequence and time-series data", "Quick math", "Database indexing"], "ans": 1},

            # DEVOPS (20)
            # DEVOPS (20)
            {"domain": "devops", "skill": "Docker", "text": "What is 'CI/CD'?", "opts": ["Continuous Integration / Continuous Deployment", "Code Improvement / Cloud Design", "Cloud Infrastructure / Code Data", "Complete Integration / Constant Development"], "ans": 0},
            {"domain": "devops", "skill": "AWS", "text": "What is 'Infrastructure as Code' (IaC)?", "opts": ["Writing code on servers", "Managing infrastructure through machine-readable definition files", "Installing OS manually", "A type of firewall"], "ans": 1},
            {"domain": "devops", "skill": "AWS", "text": "What is the purpose of 'Terraform'?", "opts": ["Designing 3D worlds", "IaC tool to build, change, and version infrastructure", "Improving Python speed", "Database management"], "ans": 1},
            {"domain": "devops", "skill": "Kubernetes", "text": "What is 'Kubernetes' principally used for?", "opts": ["Writing C++ code", "Container orchestration", "Creating websites", "Graphic design"], "ans": 1},
            {"domain": "devops", "skill": "Docker", "text": "What is a 'Docker Container'?", "opts": ["A physical box for servers", "Standalone, executable package of software", "A type of virtual machine only", "A network router"], "ans": 1},
            {"domain": "devops", "skill": "Docker", "text": "What is 'Ansible' used for?", "opts": ["Automation and configuration management", "A social media platform", "Video editing", "Game development"], "ans": 0},
            {"domain": "devops", "skill": "Docker", "text": "What is 'Prometheus' used for?", "opts": ["Writing code", "Monitoring and alerting", "Designing databases", "Compiling Java"], "ans": 1},
            {"domain": "devops", "skill": "Docker", "text": "What is 'Jenkins'?", "opts": ["An open-source automation server for CI/CD", "A cloud provider", "A type of database", "A code editor"], "ans": 0},
            {"domain": "devops", "skill": "System Design", "text": "What is 'Microservices Architecture'?", "opts": ["Very small servers", "Devising an app as a collection of small autonomous services", "Using only one database", "Simplified code structure"], "ans": 1},
            {"domain": "devops", "skill": "Docker", "text": "What is 'GitOps'?", "opts": ["Using Git for everything", "Using Git repositories as source of truth for infra and apps", "Git for designers", "Operations done on Git servers only"], "ans": 1},
            {"domain": "devops", "skill": "Kubernetes", "text": "What is 'Sidecar Pattern' in Kubernetes?", "opts": ["A bicycle accessory", "Container running alongside the main application container", "A backup database", "A type of load balancer"], "ans": 1},
            {"domain": "devops", "skill": "AWS", "text": "What is 'Horizontal Scaling'?", "opts": ["Buying a faster CPU", "Adding more machines to the pool of resources", "Stacking servers vertically", "Adding more RAM"], "ans": 1},
            {"domain": "devops", "skill": "Docker", "text": "What is 'Zero Downtime Deployment'?", "opts": ["Deploying at midnight", "Deploying changes without any interruption in service", "Fastest possible deployment", "Server never sleeps"], "ans": 1},
            {"domain": "devops", "skill": "Docker", "text": "What is 'YAML' primarily used for?", "opts": ["Programming logic", "Configuration files", "Creating images", "Handling database queries"], "ans": 1},
            {"domain": "devops", "skill": "System Design", "text": "What is 'NGINX' mostly used for?", "opts": ["Code editor", "Web server, reverse proxy, and load balancer", "Machine learning", "Database"], "ans": 1},
            {"domain": "devops", "skill": "System Design", "text": "What is 'Site Reliability Engineering' (SRE)?", "opts": ["Building durable websites", "Applying software engineering to operations", "Fixing computers", "Customer service"], "ans": 1},
            {"domain": "devops", "skill": "Docker", "text": "What is 'Blue-Green Deployment'?", "opts": ["Colorful UI", "Technique with two identical production environments", "Testing on two different days", "Upgrading OS steps"], "ans": 1},
            {"domain": "devops", "skill": "AWS", "text": "What is 'Cloud-Native'?", "opts": ["Born in the sky", "Apps designed to exploit cloud-computing models", "Always online", "Using Gmail"], "ans": 1},
            {"domain": "devops", "skill": "AWS", "text": "What is 'VPC'?", "opts": ["Very Private Computer", "Virtual Private Cloud", "Velocity Page Center", "Vertical Power Connection"], "ans": 1},
            {"domain": "devops", "skill": "System Design", "text": "What is 'Load Balancing'?", "opts": ["Carrying servers", "Distributing network traffic across multiple servers", "Cleaning the server", "Monitoring CPU"], "ans": 1},

            # DSA (20)
            {"domain": "dsa", "skill": "System Design", "text": "What is the time complexity of binary search?", "opts": ["O(n)", "O(log n)", "O(n^2)", "O(1)"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "Which data structure is best for BFS (Breadth-First Search)?", "opts": ["Stack", "Queue", "Heap", "B-Tree"], "ans": 1},
            {"domain": "dsa", "skill": "SQL", "text": "What is a 'Hash Table'?", "opts": ["A table made of wood", "Data structure mapping keys to values", "A list of numbers", "A type of tree"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "What is 'Dynamic Programming'?", "opts": ["Programming while moving", "Solving complex problems by breaking them into simpler subproblems", "Live coding", "Visual programming"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "What is the time complexity of Quick Sort (average)?", "opts": ["O(n)", "O(n^2)", "O(n log n)", "O(log n)"], "ans": 2},
            {"domain": "dsa", "skill": "System Design", "text": "What is a 'Linked List'?", "opts": ["A list of web links", "Sequence of nodes where each node points to the next", "An array with no size", "A database table"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "What is 'Recursion'?", "opts": ["Repeating a task", "A function calling itself", "A loop that never ends", "A sorting algorithm"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "What is a 'Binary Search Tree' (BST)?", "opts": ["A tree with 2 branches", "Tree where left child is smaller and right is larger than parent", "A sorted array", "A type of x", "A sorting technique"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "What is the time complexity of accessing an element in an array by index?", "opts": ["O(n)", "O(log n)", "O(1)", "O(n log n)"], "ans": 2},
            {"domain": "dsa", "skill": "System Design", "text": "Which data structure is used to implement DFS?", "opts": ["Queue", "Stack", "Priority Queue", "Array"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "What is 'Space Complexity'?", "opts": ["Size of the universe", "Amount of memory used by an algorithm", "Time taken to run", "Length of the code"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "What is a 'Min-Heap'?", "opts": ["A small pile", "Binary tree where parent is always smaller than its children", "A type of stack", "A sorted list"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "What is 'Amortized Analysis'?", "opts": ["Paying off a mortgage", "Average performance of an operation over a sequence", "Binary search on floats", "Complexity of deletion"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "What is a 'Graph' in DSA?", "opts": ["A line chart", "Set of nodes connected by edges", "A type of array", "A 3D model"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "What is the 'Dijkstra's Algorithm' used for?", "opts": ["Sorting a list", "Finding the shortest path in a graph", "Inverting a binary tree", "Compressing data"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "What is 'Big O Notation'?", "opts": ["A circular array", "Mathematical notation describing the limiting behavior of a function", "A type of bubble sort", "The size of an object"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "What is 'Memoization'?", "opts": ["Memorizing the code", "Storing results of expensive function calls", "Improving UI speed", "Writing comments"], "ans": 1},
            {"domain": "dsa", "skill": "System Design", "text": "What is a 'Trie'?", "opts": ["A three-way search tree used for strings", "A type of heap", "A boolean array", "A sorting technique"], "ans": 0},
            {"domain": "dsa", "skill": "System Design", "text": "What is the worst-case complexity of Bubble Sort?", "opts": ["O(n)", "O(log n)", "O(n^2)", "O(1)"], "ans": 2},
            {"domain": "dsa", "skill": "System Design", "text": "What is 'AVL Tree'?", "opts": ["Automated Velocity List", "Self-balancing binary search tree", "A tree with 3 children per node", "Advanced Variable Logic"], "ans": 1},
        ]

        self.stdout.write('Creating Assessment Questions (100 total)...')
        questions_to_create = []
        for q in questions_pool:
            questions_to_create.append(AssessmentQuestion(
                domain=q["domain"],
                skill=skills.get(q.get("skill")),
                question_text=q["text"],
                option_a=q["opts"][0],
                option_b=q["opts"][1],
                option_c=q["opts"][2],
                option_d=q["opts"][3],
                correct_option=q["ans"],
                difficulty="intermediate"
            ))
        
        AssessmentQuestion.objects.bulk_create(questions_to_create)

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with 100% complete backend demo data!'))
