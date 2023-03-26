import axios from "axios";

require('dotenv').config({ path: '.env.test' });

describe("Test ping route", () => {
    beforeEach(() => {
        jest.resetModules()
    });

    test("Ping POST", async () => {

        const res = await axios({
            method: "POST",
            url: process.env.SERVER_API_BASE_URL + "api/v1/ping",
            validateStatus: () => true
        });

        expect(res.data).toEqual(
            {
                success: true,
                message: "",
                data: "pong!"
            }
        );
    });


    test("Ping GET should fail", async () => {

        const res = await axios({
            method: "GET",
            url: process.env.SERVER_API_BASE_URL + "api/v1/ping",
            validateStatus: () => true
        });

        expect(res.status).toEqual(404);
    });
});