/*
 This file is part of Subsonic.

 Subsonic is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Subsonic is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Subsonic.  If not, see <http://www.gnu.org/licenses/>.

 Copyright 2009 (C) Sindre Mehus
 */
package net.sourceforge.subsonic.ajax;

import net.sourceforge.subsonic.Logger;
import net.sourceforge.subsonic.domain.UserSettings;
import net.sourceforge.subsonic.service.SecurityService;
import net.sourceforge.subsonic.service.SettingsService;

import org.directwebremoting.WebContext;
import org.directwebremoting.WebContextFactory;

import com.github.hakko.musiccabinet.dao.util.URIUtil;
import com.github.hakko.musiccabinet.exception.ApplicationException;
import com.github.hakko.musiccabinet.service.StarService;

/**
 * Provides AJAX-enabled services for starring.
 * <p/>
 * This class is used by the DWR framework (http://getahead.ltd.uk/dwr/).
 */
public class UIStarService {

	private static final Logger LOG = Logger.getLogger(UIStarService.class);

	private SecurityService securityService;
	private SettingsService settingsService;
	private StarService starService;

	public void starArtist(String artistUri) {
		starService.starArtist(getUser(), URIUtil.parseURI(artistUri));
	}

	public void unstarArtist(String artistUri) {
		starService.unstarArtist(getUser(), URIUtil.parseURI(artistUri));
	}

	public void starAlbum(String albumUri) {
		try {
			starService.starAlbum(getUser(), URIUtil.parseURI(albumUri));
		} catch (Exception e) {
			LOG.error("Error starring album " + e.getMessage(), e);
		}
	}

	public void unstarAlbum(String albumUri) {
		try {

			starService.unstarAlbum(getUser(), URIUtil.parseURI(albumUri));
		} catch (Exception e) {
			LOG.error("Error starring album " + e.getMessage(), e);
		}

	}

	public void starTrack(String trackUri) {
		try {
			starService.starTrack(getUser(), URIUtil.parseURI(trackUri));
		} catch (ApplicationException e) {
			LOG.warn("Could not post starred track as loved song on last.fm!",
					e);
		}
	}

	public void unstarTrack(String trackUri) {
		try {
			starService.unstarTrack(getUser(), URIUtil.parseURI(trackUri));
		} catch (ApplicationException e) {
			LOG.warn(
					"Could not post unstarred track as unloved song on last.fm!",
					e);
		}
	}

	private String getUser() {
		WebContext webContext = WebContextFactory.get();
		UserSettings userSettings = settingsService
				.getUserSettings(securityService.getCurrentUsername(webContext
						.getHttpServletRequest()));
		return userSettings.getLastFmUsername();
	}

	// Spring setters

	public void setSecurityService(SecurityService securityService) {
		this.securityService = securityService;
	}

	public void setSettingsService(SettingsService settingsService) {
		this.settingsService = settingsService;
	}

	public void setStarService(StarService starService) {
		this.starService = starService;
	}

}
