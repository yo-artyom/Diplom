require "rulers/version"
require "rulers/array"

module Rulers
  class Application
    def call(env)
      `echo debug > debug.txt`;
      [200, {'Content-Type' => 'text/html'}, ["<h1>Hello from gem!</h1>"] ]
    end
  end
end
