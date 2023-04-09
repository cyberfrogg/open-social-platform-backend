const verifyAccountEmailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{WEBSITENAME} - {SUBJECT}</title>
        <style>
            *{
                font-weight: 300 !important;
                font-size: 14px;
                font-family: 'Roboto', 'Segoe UI', 'Open Sans', 'Helvetica Neue', sans-serif !important;
                padding: 0;
                margin: 0;
                letter-spacing: 0.5px !important;
                line-height: 2em !important;
                color: black !important;
            }
            a{
                color: #b757ff !important;
            }
            .container{
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
            }
            .header{
                width: calc(100% - 40px);
                padding: 0 20px;
                height: 50px;
                border-bottom: 1px solid gray;
            }
            .header .logo{
                display: flex;
                align-items: center;
                height: 100%;
                text-transform: uppercase;
                font-size: 20px;
                text-decoration: none !important;
            }
            .body{
                width: calc(100% - 40px);
                margin: 0 auto !important;
                max-width: 600px;
                min-height: 200px !important;
                border: 20px solid transparent;
            }
            .body > h1{
                font-weight: 600;
                margin-bottom: 1em;
                font-size: 16px;
            }
            .body > p{
                margin-bottom: 2em;
            }
            .body > p > a{
                cursor: pointer;
                text-decoration: underline !important;
            }
            .body > p > b{
                font-weight: 600;
            }
            .footer{
                width: calc(100% - 40px);
                padding: 20px;
            }
            .center_list{
                list-style: none;
            }
            .center_list > li{
                text-aligin: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header class="header">
                <a href="{WEBSITEURL}" class="logo">{WEBSITENAME}</a>
            </header>
            <div class="body">
                {CONTENT}
            </div>
            <footer class="footer">
                <ul class="center_list">
                    <li>This message has been sent automatically. Don't reply</li>
                    <li>{WEBSITENAME} team</li>
                </ul>
            </footer>
        </div>
    </body>
    </html>
`

const GetEmailTemplateVerifyAccount = (verificationToken: string) => {
    let result = verifyAccountEmailTemplate;
    let url = process.env.WEBSITE_URL + "auth/emailverify?" + new URLSearchParams({ token: verificationToken })
    result = result.replace("{WEBSITENAME}", process.env.WEBSITE_NAME as string);
    result = result.replace("{WEBSITENAME}", process.env.WEBSITE_NAME as string);
    result = result.replace("{WEBSITENAME}", process.env.WEBSITE_NAME as string);
    result = result.replace("{WEBSITEURL}", process.env.WEBSITE_URL as string);
    result = result.replace("{SUBJECT}", "Verify your account");
    result = result.replace("{CONTENT}", "Welcome to " + process.env.WEBSITE_NAME + '! Complete account creation by clicking on this link: <a href="' + url + '">' + url + "</a> <br><br> If you didn't perform this action - just ignore this email.");

    return result;
}

export default GetEmailTemplateVerifyAccount;