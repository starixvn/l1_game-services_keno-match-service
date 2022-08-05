import appConfigs from "./app-configs";

export default Object.assign(appConfigs, {
    database: {
        url: "mongodb://127.0.0.1:27017",
        options: {
            dbName: "game-service-test-db",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
});
