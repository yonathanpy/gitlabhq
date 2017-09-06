module Gitlab
  module Metrics
    # Class for tracking timing information about method calls
    class MethodCall
      attr_reader :real_time, :cpu_time, :call_count

      def self.call_real_duration_histogram
        @call_real_duration_histogram ||= Gitlab::Metrics.histogram(
          :gitlab_method_call_real_duration_seconds,
          'Method calls real duration',
          { action: nil, call_name: nil },
          [1000, 2000, 5000, 10000, 20000, 50000, 100000, 1000000]
        )
      end

      def self.call_cpu_duration_histogram
        @call_duration_histogram ||= Gitlab::Metrics.histogram(
          :gitlab_method_call_cpu_duration_seconds,
          'Method calls cpu duration',
          { action: nil, call_name: nil },
          [1000, 2000, 5000, 10000, 20000, 50000, 100000, 1000000]
        )
      end

      # name - The full name of the method (including namespace) such as
      #        `User#sign_in`.
      #
      def initialize(name, action)
        @action = action
        @name = name
        @real_time = 0
        @cpu_time = 0
        @call_count = 0
      end

      # Measures the real and CPU execution time of the supplied block.
      def measure
        start_real = System.monotonic_time
        start_cpu = System.cpu_time
        retval = yield

        @real_time += System.monotonic_time - start_real
        @cpu_time += System.cpu_time - start_cpu
        @call_count += 1

        if above_threshold?
          self.class.call_real_duration_histogram.observe({ call_name: @name, action: @action }, @real_time)
          self.class.call_cpu_duration_histogram.observe({ call_name: @name, action: @action }, @cpu_time)
        end

        retval
      end

      # Returns a Metric instance of the current method call.
      def to_metric
        Metric.new(
          Instrumentation.series,
          {
            duration: real_time,
            cpu_duration: cpu_time,
            call_count: call_count
          },
          method: @name
        )
      end

      # Returns true if the total runtime of this method exceeds the method call
      # threshold.
      def above_threshold?
        real_time >= Metrics.method_call_threshold
      end
    end
  end
end
