using MongoDB.Driver;

namespace DancesportCMS_api.Repositories
{
    public class MongoService
    {
        public IMongoDatabase Database {get;}


        public MongoService (IConfiguration config)
        {
            var connectionString = config.GetConnectionString("MongoDB")!;
            var databaseName = config["MongoDB:DatabaseName"]!;
            var client = new MongoClient(connectionString);
            Database = client.GetDatabase(databaseName);
        }
        public IMongoCollection<T> GetCollection<T>(string name)
        {
            return Database.GetCollection<T>(name);
        }
    }
}
