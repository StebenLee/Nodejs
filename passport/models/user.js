import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const userSchema = mongoose.Schema({

	local : {
		email : String,
		password : String
	},
	facebook : {
		id : String,
		token : String,
		email : String,
		name : String
	},
	twitter : {
		id : String,
		token : String,
		displayName : String,
		username : String
	},
	google : {
		id : String,
		token: String,
		email : String,
		name : String
	}

});

userSchema.methods.generateHash => (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword => (password) {
	return bcrypt.compareSync(password, this.local.password);
};

export default mongoose.model('User', userSchema);