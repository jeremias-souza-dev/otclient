-- Barra de Ki: agora nativa (Creature::ki/kiMax no servidor, LocalPlayer::m_ki
-- no cliente), enviada automaticamente no mesmo pacote de stats de HP/Mana.
-- Ver servidor/data/lib/090-ki.lua para a API Lua (getPlayerCurrentKi etc.)
-- que ainda envolve as funcoes nativas getCreatureKi/getCreatureMaxKi.
local function kiEvent()
	local player = g_game.getLocalPlayer()
	if not player then
		return
	end

	local ki, maxKi = player:getKi(), player:getMaxKi()
	if maxKi <= 0 then
		maxKi = 1
	end

	kiBarController.ui.ki.text:setText(ki .. "/" .. maxKi)
	kiBarController.ui.ki.current:setWidth(math.max(12, math.ceil(
		(kiBarController.ui.ki.total:getWidth() * ki) / maxKi)))
end

kiBarController = Controller:new()
kiBarController:setUI('game_kibar', modules.game_interface.getMainRightPanel())

function kiBarController:onInit()
end

function kiBarController:onGameStart()
	kiBarController:registerEvents(LocalPlayer, {
		onKiChange = kiEvent
	}):execute()
end
