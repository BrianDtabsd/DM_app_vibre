// Create the booklet object
const booklet = {
  id: Date.now().toString(),
  name: "EE Profile",
  savedAt: new Date().toISOString(),
  list: {
    id: "ee-profile-123",
    name: "EE Profile",
    createdAt: "2024-01-17T12:00:00.000Z",
    originalText: "Experience\nSkills\nEducation\nCertifications",
    items: [
      {
        id: "experience-123",
        title: "Experience",
        content: "Professional experience section",
        subItems: [
          {
            id: "exp-1",
            title: "Senior Engineer",
            content: "Led development team on critical projects"
          },
          {
            id: "exp-2",
            title: "Software Engineer",
            content: "Developed core platform features"
          }
        ]
      },
      {
        id: "skills-123",
        title: "Skills",
        content: "Technical skills and competencies",
        subItems: [
          {
            id: "skill-1",
            title: "Programming Languages",
            content: "Python, JavaScript, Java"
          },
          {
            id: "skill-2",
            title: "Frameworks",
            content: "React, Node.js, Django"
          }
        ]
      }
    ]
  }
};

// Add a second booklet
const booklet2 = {
  id: (Date.now() + 1).toString(),
  name: "ER Profile",
  savedAt: new Date().toISOString(),
  list: {
    id: "er-profile-123",
    name: "ER Profile",
    createdAt: "2024-01-17T12:00:00.000Z",
    originalText: "Summary\nExperience\nEducation\nSkills",
    items: [
      {
        id: "summary-123",
        title: "Summary",
        content: "Executive summary and career objectives",
        subItems: [
          {
            id: "sum-1",
            title: "Career Objective",
            content: "Seeking a challenging position in software engineering"
          }
        ]
      },
      {
        id: "education-123",
        title: "Education",
        content: "Academic background and achievements",
        subItems: [
          {
            id: "edu-1",
            title: "University Degree",
            content: "BS in Computer Science"
          },
          {
            id: "edu-2",
            title: "Certifications",
            content: "AWS Certified Developer"
          }
        ]
      }
    ]
  }
};

try {
  // Add both booklets
  const allBooklets = [booklet, booklet2];
  localStorage.setItem('dm_app_booklets', JSON.stringify(allBooklets));
  
  // Verify the booklets were added
  const savedBooklets = localStorage.getItem('dm_app_booklets');
  const parsedBooklets = JSON.parse(savedBooklets || '[]');
  
  console.log('Booklets saved:', parsedBooklets);
  document.body.innerHTML += `
    <div style="margin: 20px; padding: 20px; border: 1px solid #ccc; border-radius: 4px;">
      <h3>Storage Status:</h3>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">
        ${JSON.stringify(parsedBooklets, null, 2)}
      </pre>
    </div>
  `;
} catch (error) {
  console.error('Error:', error);
  document.body.innerHTML += `
    <div style="margin: 20px; padding: 20px; border: 1px solid #f00; border-radius: 4px; color: #f00;">
      <h3>Error:</h3>
      <pre>${error.message}</pre>
    </div>
  `;
} 