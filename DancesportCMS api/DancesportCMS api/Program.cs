using DancesportCMS_api.Repositories;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddScoped<TournamentRepository>();
builder.Services.AddScoped<BiasRepository>();
builder.Services.AddScoped<CategoryRepository>();
builder.Services.AddScoped<DanceRepository>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddSingleton<MongoService>();
builder.Services.AddScoped<VotingRepository>();
builder.Services.AddScoped<RulesViolationsRepository>();



// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseCors("AllowFrontend");


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
