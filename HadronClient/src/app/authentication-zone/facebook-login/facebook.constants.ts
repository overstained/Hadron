export class FacebookConstants {
	public static FACEBOOK_CONFIGURATION :any = {
        appId      : '380793868955124',
        cookie     : false,
        xfbml      : true,
        version    : 'v2.8'
    };

    public static FACEBOOK_SCOPE :any = {
    	scope: 'email'
    };

    public static FACEBOOK_API_URL :string = '/me?fields=email';

	//Facebook connection statuss
	public static CONNECTED :string = 'connected';
	public static UNAUTHORIZED :string = 'not_authorized';
}