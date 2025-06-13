# MockBot Local Development

...existing content...

---

## Adding a Capability to MockBot (Symlink Method)

You can add and test a robot capability with MockBot by symlinking your capability package into the agent's packages directory. This allows for live editing and easy development.

### Step-by-Step Guide

1. **Prepare Your Capability**

   Make sure your capability has a `main.js` and `package.json` (for example, in  
   `d:/Research/transitive/capabilities/initializer/files/robot`).

2. **Symlink the Capability**

   The agent's packages directory is symlinked to  
   `d:/Research/transitive/mock-bot/packages`.  
   To add your capability, run:

   ```bash
   mkdir -p /mnt/d/Research/transitive/mock-bot/packages/@transitive-robotics
   ln -s /mnt/d/Research/transitive/capabilities/initializer/files/robot \
         /mnt/d/Research/transitive/mock-bot/packages/@transitive-robotics/initializer
   ```

   This creates a symlink so any changes in your source folder are reflected in the agent's environment.

3. **Add to Desired Packages**

   Edit (or create) `d:/Research/transitive/mock-bot/config.json` and add your capability:

   ```json
   {
     "global": {
       "desiredPackages": [
         "@transitive-robotics/initializer"
       ]
     }
   }
   ```

4. **Install Dependencies**

   ```bash
   cd /mnt/d/Research/transitive/mock-bot/packages/@transitive-robotics/initializer
   npm install
   ```

5. **Restart MockBot**

   ```bash
   cd /mnt/d/Research/transitive/mock-bot
   ./mockBot.sh
   ```

6. **Verify**

   - Check logs in `mock-bot/packages/@transitive-robotics/initializer/log`
   - Use MQTT tools or the cloud UI to confirm your capability is running

---

**Tip:**  
You can symlink as many capabilities as you want using this method for rapid development