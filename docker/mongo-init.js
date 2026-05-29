// MongoDB initialization for SkillSphere
// Executed by Docker on first container startup (docker-entrypoint-initdb.d)

db = db.getSiblingDB('skillsphere');

// Create an application user with limited privileges
db.createUser({
  user: 'skillsphere_user',
  pwd: 'skillsphere_pass',
  roles: [
    { role: 'readWrite', db: 'skillsphere' }
  ]
});

// Create required collections
db.createCollection('users');
db.createCollection('skills');
db.createCollection('courses');
db.createCollection('bookings');
db.createCollection('videos');
db.createCollection('enrollments');

print('SkillSphere: database initialized');
