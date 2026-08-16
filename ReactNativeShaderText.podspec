# Copyright (c) 2026 Sebastian Peñafiel (@p-sebastian)
# SPDX-License-Identifier: MIT

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ReactNativeShaderText"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.author       = package["author"]

  s.platforms    = { :ios => "18.0" }
  s.swift_version = "5.9"
  s.source       = { :git => "https://github.com/p-sebastian/react-native-shader-text.git", :tag => "v#{s.version}" }
  s.static_framework = true

  s.source_files = [
    "ios/**/*.{h,m,mm,swift,metal}",
    "cpp/**/*.{hpp,cpp}",
  ]
  s.resource_bundles = {
    "ReactNativeShaderText" => ["ios/CocoaPodsBundledResourcePlaceholder"],
  }
  s.pod_target_xcconfig = {
    "DEFINES_MODULE" => "YES",
    "METAL_LIBRARY_OUTPUT_DIR" => "${TARGET_BUILD_DIR}/ReactNativeShaderText.bundle/",
    "SWIFT_COMPILATION_MODE" => "wholemodule",
  }

  load "nitrogen/generated/ios/ReactNativeShaderText+autolinking.rb"
  add_nitrogen_files(s)

  s.dependency "React-jsi"
  s.dependency "React-callinvoker"
  unless defined?(install_modules_dependencies)
    react_native_path = File.dirname(`node --print "require.resolve('react-native/package.json')"`)
    require File.join(react_native_path, "scripts/react_native_pods")
  end
  install_modules_dependencies(s)
end
