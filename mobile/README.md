# Mangrove Mews mobile tracker

For a Samsung and laptop sharing reports, [start the connected tracker](../README.md#run-the-connected-demo) and open the printed URLs on the two devices. The connected demo saves evidence in the laptop's private SQLite database and upload directory. Use only fictional data.

## Record the demo

Sign in on the laptop as **Beatriz** and on the Samsung as **Luz**. For a smooth recording, sign in as **Nico** in a separate browser on the Samsung before the take, or switch with **Account → Sign out** between clips. Use each person's access code from the laptop terminal.

1. **Show the starting colony.** On the laptop's map, select **Behind the laundromat**, then **Colony details**. This is Laundry Lane. Show its starting census of **7 total cats, 5 fixed, 2 awaiting TNR**.
2. **Luz sends the feeding and injury report.** On the Samsung tap **Report → Use feeding + limp sample**. This selects the colony and its fictional shared location, stages a photo and fills the note about feeding at 7:10 and seeing a limping calico. Tap **Send report** and capture **Report received**. On the laptop show **Last feeding** for Luz and the new vet alert. Close any open dialog to let the dashboard refresh.
3. **Nico sends the second photo.** In Nico's signed-in browser, tap **Report → Use second sighting → Send report**. This sends a different synthetic photo of Marigold from a separate volunteer account. Record the receipt.
4. **Beatriz compares the evidence.** On the laptop open Nico's report under **Updates**, choose **Compare cat photos**, and inspect both photos and notes. Tap **Same cat · Link to Marigold**. Show both **Confirmed sightings** on Marigold's profile. Return to **Colony details** and hold on the seven-cat census, Luz's feeding visit and the open vet alert. **Care alerts** on the map also lists the seeded pregnancy, kittens and feeder-coverage concerns.

For a live AI clip, show the analysis label on a completed report. If a report is awaiting analysis, close it and open it again after the dashboard refreshes. Staff can confirm identity manually if the agent is unavailable or returns no suggested match.

## Single-browser rehearsal

For a local rehearsal using one browser, run `npm --prefix mobile start`. For an offline rehearsal file, run `npm --prefix mobile run build` and open `mobile/dist/login.html`. These versions use demo passcode **MEWS7**, browser-local storage and sample rules. Their reports stay in that browser. Use the connected tracker above for the cross-device recording and live analysis.
