// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "FitTrackPro",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
    ],
    products: [
        .library(name: "FitTrackPro", targets: ["FitTrackPro"]),
    ],
    targets: [
        .target(
            name: "FitTrackPro",
            path: "Sources/FitTrackPro"
        ),
    ]
)
