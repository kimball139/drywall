'use strict';

exports = module.exports = function(app, mongoose) {
  var tutorSchema = new mongoose.Schema({
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' }
    },
    name: {
      first: { type: String, default: '' },
      middle: { type: String, default: '' },
      last: { type: String, default: '' },
      full: { type: String, default: '' }
    },
    tutorInfo: { type: String, default: '' },
    tutorImage: { type: String, default: '' },
    status: {
      id: { type: String, ref: 'Status' },
      name: { type: String, default: '' },
      userCreated: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, default: '' },
        time: { type: Date, default: Date.now }
      }
    },
    statusLog: [mongoose.modelSchemas.StatusLog],
    userCreated: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' },
      time: { type: Date, default: Date.now }
    },
    search: [String]
  });
  tutorSchema.plugin(require('./plugins/pagedFind'));
  tutorSchema.index({ user: 1 });
  tutorSchema.index({ 'status.id': 1 });
  tutorSchema.index({ search: 1 });
  tutorSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Tutor', tutorSchema);
};