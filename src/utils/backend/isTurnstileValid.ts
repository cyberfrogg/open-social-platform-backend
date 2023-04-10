const cloudflareTurnstileApi = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const IsTurnstileValid = async (turnstileClientResponse: string, remoteIp: string) => {
    if (turnstileClientResponse == undefined) {
        return false;
    }

    if (process.env.WEBSITE_TURNSTILE_CAPTCHA_ENABLED != "1") {
        return true;
    }

    const form = new URLSearchParams();
    form.append("secret", process.env.NEXT_PRIVATE_CLOUDFLARE_CAPTCHA_PRIVATETOKEN as string)
    form.append("response", turnstileClientResponse);
    form.append("remoteip", remoteIp);

    const result = await fetch(
        cloudflareTurnstileApi,
        {
            method: 'POST',
            body: form
        }
    );

    if (result.status != 200 && result.status != 201 && result.status != 203 && result.status != 204 && result.status != 205) {
        return false;
    }

    const resultJson = await result.json();

    if (resultJson.success == true) {
        return true;
    }

    return false;
}


export default IsTurnstileValid;