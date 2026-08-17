# MindGauge Email Backend

Private Apps Script backend for sending minimal MindGauge result summaries to the fixed HR mailbox.

Data accepted: tester name, consent, submission ID, timestamp, duration, overall reasoning score, reasoning level, performance index, performance level, time-efficiency score, average seconds per question, and five category scores. Individual answers are not accepted or emailed.

The performance index weights reasoning accuracy at 90% and bounded time efficiency at 10%. Completing in 15 minutes or less receives full time efficiency; faster completion does not add bonus beyond 100.
