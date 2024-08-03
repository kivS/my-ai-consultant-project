Sentry.init do |config|
  config.dsn = 'https://c1c0c330a4061edb1c7941cdbfe95226@o481264.ingest.us.sentry.io/4507708135112704'

  config.enabled_environments = %w[production]

  # get breadcrumbs from logs
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]

  # enable tracing
  # we recommend adjusting this value in production
  config.traces_sample_rate = 1.0

  # enable profiling
  # this is relative to traces_sample_rate
  config.profiles_sample_rate = 1.0
end
