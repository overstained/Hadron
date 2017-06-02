module.exports = function(application,
	genericConstants) {
	var uuid = require('node-uuid');
	var jwt = require('jsonwebtoken');
	var secretKey = uuid.v4();



	function tokenInterceptor(req, res, next) {
		if (req.method == 'OPTIONS') {
			return res.sendStatus(genericConstants.OK);
		}
		if (req.url === genericConstants.LOGIN_URL ||
			req.url === genericConstants.UPLOAD_URL) {
			return next();
		}
		var token = req.headers['x-auth-token'];

		if (!token) {
			return res.status(genericConstants.FORBIDDEN).json({
				message: genericConstants.INVALID_TOKEN.message
			});
		}

		try {
			jwt.verify(token, secretKey);
		} catch (ex) {
			return res.status(genericConstants.FORBIDDEN).json({
				message: genericConstants.INVALID_TOKEN.message
			});
		}

		var decodedToken = jwt.decode(token);

		req.email = decodedToken.email;

		return next();
	}

	application.use(tokenInterceptor);

	var setTodayAt8AM = function() {
		var at8am = new Date();
		at8am.setHours(8);
		at8am.setMinutes(0);
		at8am.setSeconds(0);
		return at8am;
	}

	var constantValues = genericConstants.GET_VALUES;

	return {
		generateToken: function(user) {
			return jwt.sign(user, secretKey);
		},
		verifyToken: function(token) {
			if (!token) {
				return false;
			}
			try {
				jwt.verify(data.token, secretKey);
			} catch (ex) {
				return false;
			}
			return true;
		},
		decodeToken: function(token) {
			return jwt.decode(token);
		}
	};
};