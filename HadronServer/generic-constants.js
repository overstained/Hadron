module.exports = function() {
	return {
		OK: 200,
		UNAUTHORIZED: 401,
		FORBIDDEN: 403,
		INTERNAL_ERROR: 500,
		CONFLICT: 409,

		LOGIN_URL: '/user/login',
		CREATE_BOARD_URL: '/board/create',
		GET_LAST_MODIFIED_BOARD_URL: '/board/latest',
		CHANGE_BOARD_NAME_URL: '/board/changeName',
		GET_BOARD_BY_NAME_URL: '/board/name',
		SHARE_BOARD_URL: '/board/share',
		CREATE_BOARD_URL: '/board/create',
		GET_BOARDS_LIST_URL: '/board/list',
		GET_BOARD_MEMBERS_URL: '/board/members',

		CHANGE_TEXT_DOCUMENT_NAME_URL: '/textDocument/changeName',
		SAVE_TEXT_DOCUMENT_URL: '/textDocument/save',
		GET_TEXT_DOCUMENT_BY_NAME_URL: '/textDocument/name',
		GET_TEXT_DOCUMENT_LIST_URL: '/textDocument/list',
		CREATE_TEXT_DOCUMENT_URL: '/textDocument/create',

		UPLOAD_URL: '/singleUpload',
		GET_FILES_FOR_USER_URL: '/files/user',
		GET_FILES_FOR_BOARD_URL: '/files/board',

		INVALID_TOKEN: new Error('INVALID_TOKEN'),
		UNKNOWN_USER: new Error('UNKNOWN_USER'),
		INCOMPLETE_DATA: new Error('INCOMPLETE_DATA'),
		BAD_DATA: new Error('BAD_DATA'),

		LOCAL: {
			FRONTEND_ROOT_URL: 'http://localhost:4200',
			UPLOAD_DIR_BASE: 'C:/Uploads/'
		},
		PROD: {
			FRONTEND_ROOT_URL: 'http://178.62.127.9:4200',
			UPLOAD_DIR_BASE: '/root/Uploads/'
		}
	}
};