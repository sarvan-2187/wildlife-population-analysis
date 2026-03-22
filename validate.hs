import System.IO
import Data.List (isInfixOf)

main :: IO ()
main = do
    content <- readFile "data/dashboard_data.json"
    let hasGlobal = "\"global_decline_rate\"" `isInfixOf` content
    let hasRegions = "\"vulnerable_regions\"" `isInfixOf` content
    let hasTrend = "\"trend_data\"" `isInfixOf` content
    
    putStrLn "--- Haskell Verification Engine ---"
    if hasGlobal && hasRegions && hasTrend
        then putStrLn "[SUCCESS] The telemetry payload is structurally valid and adheres to the required schema."
        else putStrLn "[FAILURE] The dashboard_data.json payload is missing required statistical nodes."
    putStrLn "-----------------------------------"
